# Zigbee 照明連携セットアップマニュアル

OLEDWorks **Brite 3**（電球色 3000K 固定）をアプリから操作するための、Zigbee2MQTT 連携の完全な設定手順です。
ゲストには接続作業をさせず、**ご滞在中に自動で接続**して操作できる状態を作ることを目的としています。

> **重要：** OLEDWorks Brite 3 は色温度が固定の有機ELパネルです。本アプリが送信するのは
> **点灯/消灯（state）** と **明るさ（brightness 0–254）** のみで、色温度（color_temp）は送信しません。

---

## 1. 仕組み（全体像）

ゲストのスマートフォン上のアプリは、次の経路で実際の照明を操作します。

```
[ゲストのアプリ]
      │  ① HTTPS（滞在中のみ）
      ▼
[Next.js APIルート  /api/lighting/zigbee]
      │  ② MQTT publish  →  zigbee2mqtt/<名前>/set  {"state":"ON","brightness":180}
      ▼
[MQTTブローカー  Mosquitto]
      │  ③ 購読
      ▼
[Zigbee2MQTT]
      │  ④ Zigbee無線
      ▼
[Zigbee調光器 / 調光対応ドライバ]
      │  ⑤ 0-10V / PWM / 位相制御で調光
      ▼
[OLEDWorks Brite 3 パネル]
```

- **②が連携の心臓部です。** Zigbee2MQTT には汎用の REST API が無いため、制御は必ず **MQTT** で行います。
- アプリは MQTT トピック `zigbee2mqtt/<friendly_name>/set` に JSON を publish します。
- Brite 3 は調光対応の定電流ドライバ（または 0-10V/PWM対応ドライバ）で点灯し、その調光信号を **Zigbee 調光モジュール**が出力します。

---

## 2. 必要な機材

| # | 機材 | 例 / 補足 |
|---|------|-----------|
| 1 | **常時稼働サーバー** | Raspberry Pi 4 (4GB以上) / ミニPC。Zigbee2MQTT と Mosquitto を動かす |
| 2 | **Zigbee コーディネーター** | Sonoff Zigbee 3.0 USB Dongle Plus (EFR32MG21) / ConBee II など USB ドングル |
| 3 | **Zigbee 調光モジュール** | OLED ドライバの調光方式に合わせる：<br>・0-10V調光ドライバ → Zigbee 0-10V/1-10V 調光器<br>・位相制御調光 → Zigbee ダイマー（例: Aqara/Tuya 調光モジュール）<br>・PWM対応 → Zigbee PWM ダイマー |
| 4 | **Brite 3 用 調光対応ドライバ** | Brite 3 の定格に合う定電流/定電圧ドライバ（調光対応品） |
| 5 | **安定したLAN** | サーバーと宅内ルーターを有線接続推奨 |

> OLED パネルの配線・ドライバ選定・調光方式の決定は、**必ず電気工事の有資格者**が行ってください。
> 100V以上の結線が伴う場合、日本では電気工事士の資格が必要です。

---

## 3. Zigbee2MQTT と MQTTブローカーの導入

### 3-1. Mosquitto（MQTTブローカー）をインストール

```bash
# Raspberry Pi OS / Debian / Ubuntu
sudo apt update
sudo apt install -y mosquitto mosquitto-clients
sudo systemctl enable mosquitto
```

認証を有効にします（推奨）。

```bash
# ユーザー lumina を作成（パスワードを対話入力）
sudo mosquitto_passwd -c /etc/mosquitto/passwd lumina
```

`/etc/mosquitto/conf.d/lumina.conf` を作成：

```conf
listener 1883 0.0.0.0
allow_anonymous false
password_file /etc/mosquitto/passwd
```

```bash
sudo systemctl restart mosquitto
```

### 3-2. Zigbee2MQTT をインストール

公式手順：<https://www.zigbee2mqtt.io/guide/installation/01_linux.html>

```bash
sudo apt install -y nodejs git make g++ gcc
sudo mkdir /opt/zigbee2mqtt && sudo chown $USER /opt/zigbee2mqtt
git clone --depth 1 https://github.com/Koenkk/zigbee2mqtt.git /opt/zigbee2mqtt
cd /opt/zigbee2mqtt
npm ci
```

コーディネーターのデバイスパスを確認：

```bash
ls -l /dev/serial/by-id
# 例: usb-Silicon_Labs_Sonoff_Zigbee_3.0_USB_Dongle_Plus_xxxx -> /dev/ttyUSB0
```

`/opt/zigbee2mqtt/data/configuration.yaml` を編集：

```yaml
homeassistant: false
permit_join: false          # 普段はfalse。ペアリング時のみ一時的にtrue

mqtt:
  base_topic: zigbee2mqtt
  server: mqtt://localhost:1883
  user: lumina
  password: あなたのパスワード

serial:
  port: /dev/serial/by-id/usb-Silicon_Labs_Sonoff_Zigbee_3.0_USB_Dongle_Plus_xxxx-if00-port0

frontend:
  enabled: true             # 管理用WebUI（任意）
  port: 8080

advanced:
  network_key: GENERATE     # 初回起動時に自動生成（重要：流出させない）
  transmit_power: 20
```

起動：

```bash
cd /opt/zigbee2mqtt && npm start
```

`http://<サーバーIP>:8080` で Web UI が開けば成功です。

### 3-3. 自動起動（systemd）

`/etc/systemd/system/zigbee2mqtt.service`：

```ini
[Unit]
Description=zigbee2mqtt
After=network.target

[Service]
ExecStart=/usr/bin/npm start
WorkingDirectory=/opt/zigbee2mqtt
StandardOutput=inherit
StandardError=inherit
Restart=always
User=pi

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable zigbee2mqtt
sudo systemctl start zigbee2mqtt
```

---

## 4. 照明（調光器）のペアリング

1. Web UI（`:8080`）右上の **「Permit join (All)」** を ON にする（または configuration.yaml で `permit_join: true` → 再起動）。
2. Zigbee 調光モジュールを**ペアリングモード**にする（多くは電源投入後に素早く数回 ON/OFF、または本体ボタン長押し）。
3. UI のデバイス一覧に新しいデバイスが現れたら成功。
4. **ペアリングが終わったら必ず Permit join を OFF に戻す**（不正なデバイスの参加防止）。

### 4-1. friendly_name を分かりやすく設定

各デバイスの設定（⚙）→ **Friendly name** を、アプリの env と一致させて命名します。

| ゾーン | 推奨 friendly_name |
|--------|--------------------|
| リビング | `lumina_living` |
| 寝室 | `lumina_bedroom` |
| バスルーム | `lumina_bathroom` |
| エントランス | `lumina_entrance` |

### 4-2. 全灯グループ `lumina_all` を作成（推奨）

アプリの「すべて点灯/消灯」やシーン適用は `all` ゾーンを使います。グループを作ると 1 回の publish で全灯を同時制御でき、反応が速くなります。

1. Web UI → **Groups** → Create group → 名前 `lumina_all`。
2. 上記4つのデバイスをグループに追加。

> グループを作らない場合でも動作します（アプリが各ゾーンへ個別に送信します）が、グループ作成を推奨します。

### 4-3. 動作テスト（MQTT直叩き）

```bash
# 点灯・明るさ70%（254×0.7≒178）
mosquitto_pub -h localhost -u lumina -P あなたのパスワード \
  -t 'zigbee2mqtt/lumina_all/set' -m '{"state":"ON","brightness":178,"transition":1}'

# 消灯
mosquitto_pub -h localhost -u lumina -P あなたのパスワード \
  -t 'zigbee2mqtt/lumina_all/set' -m '{"state":"OFF","transition":1}'
```

照明が反応すれば Zigbee 側の準備は完了です。

---

## 5. アプリ側の設定（環境変数）

`.env.local`（ローカル）または Vercel → Settings → Environment Variables に設定します。

| 変数名 | 説明 | 例 |
|--------|------|-----|
| `ZIGBEE_MQTT_URL` | MQTTブローカーのURL。**未設定だとシミュレーションモード** | `mqtt://192.168.1.50:1883` |
| `ZIGBEE_MQTT_USERNAME` | ブローカー認証ユーザー名 | `lumina` |
| `ZIGBEE_MQTT_PASSWORD` | ブローカー認証パスワード | `********` |
| `ZIGBEE_BASE_TOPIC` | ベーストピック（既定 `zigbee2mqtt`） | `zigbee2mqtt` |
| `ZIGBEE_DEVICES` | ゾーン→friendly_name の JSON マップ | 下記参照 |

```bash
ZIGBEE_DEVICES={"all":"lumina_all","living":"lumina_living","bedroom":"lumina_bedroom","bathroom":"lumina_bathroom","entrance":"lumina_entrance"}
```

設定後、ローカルなら再起動、Vercel なら **Redeploy** で反映されます。

> アプリは Node ランタイムで `mqtt` パッケージを使って publish します（`package.json` に追加済み）。
> `ZIGBEE_MQTT_URL` が無い／ブローカーに繋がらない場合は自動的にシミュレーションモードになり、
> UI は通常どおり反応しますが実機には送信しません。

---

## 6. ネットワーク構成（クラウド配信時の要点）

アプリを **Vercel 等のクラウド**に置く場合、クラウドから宅内の MQTT ブローカーへは直接到達できません。次のいずれかを選びます。

- **方式A（推奨・シンプル）：アプリも宅内サーバーで動かす**
  Raspberry Pi/ミニPC上で `npm run build && npm start`（または Docker）し、同一LAN内の `mqtt://localhost:1883` に接続。クラウド不要で遅延も最小。
- **方式B：セキュアトンネル**
  クラウドのアプリから宅内ブローカーへ **Tailscale** や **Cloudflare Tunnel** で到達させる。`ZIGBEE_MQTT_URL` にトンネル経由のアドレスを指定。
- **方式C：TLS付きで限定公開**
  ブローカーを `mqtts://`（8883/TLS）で公開し、強固な認証＋ファイアウォール許可IP限定。上級者向け。

> いずれの場合も **1883番ポートをインターネットに直接開放しない**でください。

---

## 7. トラブルシューティング

| 症状 | 確認ポイント |
|------|--------------|
| アプリのバッジが「シミュレーション」のまま | `ZIGBEE_MQTT_URL` 未設定 / ブローカー未到達。`mosquitto_sub -t '#' -v` で疎通確認 |
| 「接続中」から進まない | ファイアウォール・認証情報（user/password）・URLのスキーム（`mqtt://`）を確認 |
| 操作しても照明が反応しない | `friendly_name` と `ZIGBEE_DEVICES` の綴りが一致しているか。`mosquitto_pub` の直叩きで切り分け |
| 一部のゾーンだけ反応しない | 該当デバイスの friendly_name、グループ所属、Zigbee電波（中継器/距離）を確認 |
| 明るさが粗い/ちらつく | OLEDドライバの調光方式と Zigbee 調光器の出力方式（0-10V/PWM/位相）が一致しているか |
| ペアリングできない | Permit join が ON か、コーディネーターのファーム更新、デバイスのリセット手順を再確認 |

ログ確認：

```bash
journalctl -u zigbee2mqtt -f          # Zigbee2MQTT
mosquitto_sub -h localhost -u lumina -P *** -t 'zigbee2mqtt/#' -v   # 全トピック監視
```

---

## 8. セキュリティ・運用の注意

- `network_key`（Zigbee）、MQTTパスワード、`.env.local` は**絶対に Git にコミットしない**。
- ゲストには Zigbee/MQTT の認証情報を一切共有しない（接続はアプリが自動で行う）。
- 操作はアプリ側で**滞在中フェーズのみ**許可されます（予約済・滞在後は送信しません）。
- 定期的に Zigbee2MQTT / Mosquitto / OS をアップデートする。
- コーディネーターのファームウェアも年1回程度の更新を推奨。

---

### 参考リンク

- Zigbee2MQTT – MQTT トピックとメッセージ: <https://www.zigbee2mqtt.io/guide/usage/mqtt_topics_and_messages.html>
- Zigbee2MQTT – インストール: <https://www.zigbee2mqtt.io/guide/installation/>
- Zigbee2MQTT – Devices & Groups: <https://www.zigbee2mqtt.io/guide/configuration/devices-groups.html>
- OLEDWorks Brite 3: <https://www.oledworks.com/oled-lighting-products/brite-3/>
