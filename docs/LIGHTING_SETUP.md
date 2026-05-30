# 照明連携セットアップマニュアル（Zigbee / DALI-2）

OLEDWorks **Brite 3**（電球色 3000K 固定）をアプリから操作するための、照明連携の完全な設定手順です。
本アプリは **Zigbee** と **DALI-2** の 2 つのプロトコルに対応し、どちらか一方または両方を同時に使用できます。
ゲストには接続作業をさせず、**ご滞在中に自動で接続**して操作できる状態を作ることを目的としています。

> **重要：** OLEDWorks Brite 3 は色温度が固定の有機ELパネルです。本アプリが送信するのは
> **点灯/消灯（state）** と **明るさ（0–100%）** のみで、色温度は送信しません。
> OLED の特性として、明るさを絞るほど自然に暖かな色合いへと変化します（dim-to-warm）。

---

## 1. どちらを選ぶ？（Zigbee と DALI-2 の比較）

| | **Zigbee** | **DALI-2** |
|---|---|---|
| 配線 | 無線（電源配線のみ） | 専用2線バス（極性フリー） |
| 規模 | 住宅〜小規模 | 住宅〜大規模・商業（1ラインで64台/16グループ/16シーン） |
| 調光精度 | デバイス依存 | 規格化された対数調光（256段階）・高精度 |
| Brite 3 との相性 | Zigbee 調光器 ＋ 調光ドライバ | **DALI-2 調光ドライバに直結**（Brite 3 が標準対応） |
| 導入の手軽さ | ◎ 手軽 | ○ 試運転（コミッショニング）が必要 |
| 推奨用途 | 既存物件への後付け | 新築・施工時に組み込む高品位設備 |

- **手軽さ重視・後付け** → Zigbee（§4）
- **品位・拡張性重視・施工時に組み込む** → DALI-2（§5）
- **両方** → `LIGHTING_BACKEND=both` でゾーンごとに併用も可能

---

## 2. 仕組み（全体像）

アプリは、選択したバックエンドへ滞在中のみコマンドを送信します。

```
[ゲストのアプリ]（滞在中のみ）
        │ HTTPS
        ▼
[Next.js API  /api/lighting]
        │  LIGHTING_BACKEND で分岐
        ├───────────────┬──────────────────┐
        ▼               ▼
   ① Zigbee          ② DALI-2
   MQTT publish      HTTP POST
   zigbee2mqtt/      {gateway}/command
   <名前>/set        {target,level,...}
        ▼               ▼
   MQTTブローカー     DALI-2 IPゲートウェイ
        ▼               ▼
   Zigbee2MQTT       DALI バス
        ▼               ▼
   Zigbee調光器      DALI-2調光ドライバ
        └───────┬───────┘
                ▼
        OLEDWorks Brite 3 パネル
```

- アプリ → サーバー間は常に **明るさ%（0–100）** と **state** のみ。
- サーバー（`lib/lighting-control.ts`）が各プロトコルの値へ変換します。
  - Zigbee … 線形 0–254
  - DALI-2 … 対数 arc power level（IEC 62386 のカーブ）

---

## 3. 共通：必要な常時稼働サーバー

| 機材 | 例 / 補足 |
|------|-----------|
| 常時稼働サーバー | Raspberry Pi 4 (4GB+) / ミニPC。Zigbee2MQTT・MQTTブローカー、または DALI ゲートウェイのアダプタを動かす |
| 安定したLAN | サーバーと宅内ルーターを有線接続推奨 |

> OLEDパネルの配線・ドライバ選定・100V結線は**必ず電気工事の有資格者**が行ってください。

---

## 4. バックエンドA：Zigbee

### 4-1. 必要な機材

| # | 機材 | 例 |
|---|------|-----|
| 1 | Zigbee コーディネーター | Sonoff Zigbee 3.0 USB Dongle Plus / ConBee II |
| 2 | Zigbee 調光モジュール | OLEDドライバの調光方式に合わせる（0-10V / 位相制御 / PWM） |
| 3 | 調光対応ドライバ | Brite 3 の定格に合う調光対応の定電流/定電圧ドライバ |

### 4-2. Mosquitto（MQTTブローカー）

```bash
sudo apt update && sudo apt install -y mosquitto mosquitto-clients
sudo systemctl enable mosquitto
sudo mosquitto_passwd -c /etc/mosquitto/passwd lumina   # パスワード対話入力
```

`/etc/mosquitto/conf.d/lumina.conf`：

```conf
listener 1883 0.0.0.0
allow_anonymous false
password_file /etc/mosquitto/passwd
```

```bash
sudo systemctl restart mosquitto
```

### 4-3. Zigbee2MQTT

公式手順：<https://www.zigbee2mqtt.io/guide/installation/>

```bash
sudo apt install -y nodejs git make g++ gcc
sudo mkdir /opt/zigbee2mqtt && sudo chown $USER /opt/zigbee2mqtt
git clone --depth 1 https://github.com/Koenkk/zigbee2mqtt.git /opt/zigbee2mqtt
cd /opt/zigbee2mqtt && npm ci
ls -l /dev/serial/by-id     # コーディネーターのポートを確認
```

`/opt/zigbee2mqtt/data/configuration.yaml`：

```yaml
homeassistant: false
permit_join: false          # 普段はfalse。ペアリング時のみ一時true
mqtt:
  base_topic: zigbee2mqtt
  server: mqtt://localhost:1883
  user: lumina
  password: あなたのパスワード
serial:
  port: /dev/serial/by-id/usb-...-port0
frontend:
  enabled: true
  port: 8080
advanced:
  network_key: GENERATE     # 初回自動生成（流出厳禁）
  transmit_power: 20
```

systemd 自動起動（`/etc/systemd/system/zigbee2mqtt.service`）：

```ini
[Unit]
Description=zigbee2mqtt
After=network.target
[Service]
ExecStart=/usr/bin/npm start
WorkingDirectory=/opt/zigbee2mqtt
Restart=always
User=pi
[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload && sudo systemctl enable --now zigbee2mqtt
```

### 4-4. ペアリングと friendly_name

1. Web UI（`:8080`）で **Permit join** を一時ON。
2. Zigbee 調光モジュールをペアリングモードにする。
3. デバイスが現れたら、設定（⚙）→ **Friendly name** をアプリの env と一致させて命名。
4. **完了後は Permit join を必ず OFF**。

| ゾーン | friendly_name |
|--------|---------------|
| リビング | `lumina_living` |
| 寝室 | `lumina_bedroom` |
| バスルーム | `lumina_bathroom` |
| エントランス | `lumina_entrance` |

### 4-5. 全灯グループ `lumina_all`

Web UI → **Groups** → `lumina_all` を作成し4ゾーンを追加（1回の publish で全灯制御でき高速）。

### 4-6. テスト

```bash
mosquitto_pub -h localhost -u lumina -P *** \
  -t 'zigbee2mqtt/lumina_all/set' -m '{"state":"ON","brightness":178,"transition":1}'
```

照明が反応すれば Zigbee 側は完了。アプリの env は §6 へ。

---

## 5. バックエンドB：DALI-2

### 5-1. 必要な機材

| # | 機材 | 例 |
|---|------|-----|
| 1 | **DALI-2 IP ゲートウェイ** | Lunatone DALI-2 IoT Gateway（REST/WebSocket）/ Lunatone DALI-2 Display など |
| 2 | **DALI-2 調光ドライバ** | Brite 3 用の **DALI-2 対応 定電流ドライバ**（DALI が制御対象=control gear） |
| 3 | DALI バス配線 | 2線・極性フリー・最長約300m・最大64アドレス/16グループ/ライン |

> Brite 3 は DALI-2 調光に標準対応。DALI-2 ドライバを使えば調光器を介さず**バス直結**で制御できます。

### 5-2. コミッショニング（試運転）

1. ゲートウェイにドライバ（control gear）を接続し、電源投入。
2. ゲートウェイの設定ツールで**アドレッシング**（各ドライバへ short address を割当）。
3. 部屋ごとに **DALI グループ**を割当（例：リビング=Group 0、寝室=Group 1 …）。
4. ゲートウェイの IP アドレスを固定（DHCP予約 or 静的IP）。

| ゾーン | DALI アドレス指定（`DALI_DEVICES` の値） |
|--------|------------------------------------------|
| 全灯 | `broadcast` |
| リビング | `group:0` |
| 寝室 | `group:1` |
| バスルーム | `group:2` |
| エントランス | `group:3` |

> 個別アドレスを使う場合は `short:5` のように指定します。

### 5-3. アプリ → ゲートウェイの JSON コントラクト

アプリは DALI ゲートウェイへ次の HTTP リクエストを送ります（`lib/lighting-control.ts`）。

```
POST {DALI_GATEWAY_URL}{DALI_COMMAND_PATH | "/command"}
Authorization: Bearer {DALI_GATEWAY_TOKEN}   （任意）
Content-Type: application/json

{
  "target":   "<addrspec>",   // DALI_DEVICES の値: "broadcast" | "group:0" | "short:5"
  "command":  "ARC",           // Direct Arc Power Control (DAPC)
  "level":    0-254,           // DALI arc power level（対数カーブ済み）
  "state":    "ON" | "OFF",
  "fadeTime": 1                // 秒
}
```

ヘルスチェック：`GET {DALI_GATEWAY_URL}{DALI_HEALTH_PATH | "/status"}`（200 で接続済み判定）。

### 5-4. 実ゲートウェイへの適合（アダプタ）

ゲートウェイの API がこのコントラクトと異なる場合は、**間に小さなアダプタ**を挟みます。
以下は Lunatone DALI-2 IoT 風のゲートウェイへ橋渡しする最小例（Node.js / Express）です。

```js
// dali-adapter.js  —  アプリの汎用コントラクト → 実ゲートウェイAPI へ変換
import express from 'express'
const app = express()
app.use(express.json())

const GW = process.env.REAL_DALI_URL // 例: http://192.168.1.60/api

app.get('/status', async (_req, res) => {
  try { const r = await fetch(`${GW}/health`); res.sendStatus(r.ok ? 200 : 502) }
  catch { res.sendStatus(502) }
})

app.post('/command', async (req, res) => {
  const { target, level, state } = req.body
  // target を実ゲートウェイのアドレス指定へ変換
  const [kind, id] = String(target).split(':')
  const addr = kind === 'broadcast' ? 'broadcast' : `${kind}/${id}` // 例: group/0
  const value = state === 'OFF' ? 0 : level                          // 0-254
  const r = await fetch(`${GW}/dali/${addr}/arc`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ value }),
  })
  res.sendStatus(r.ok ? 200 : 502)
})

app.listen(8090, () => console.log('DALI adapter on :8090'))
```

この場合、アプリ側は `DALI_GATEWAY_URL=http://<サーバー>:8090` を指定します。

> **dali2mqtt（MQTT橋渡し）を使う場合**：DALI USB インターフェース＋
> [dali2mqtt](https://github.com/dgomes/dali2mqtt) で DALI を MQTT 化できます。
> その場合は上記アダプタを「MQTT publish」に置き換えるか、Zigbee と同じ MQTT 経路に寄せます。

### 5-5. テスト

```bash
# 汎用コントラクト（またはアダプタ）へ直接 POST
curl -X POST http://<サーバー>:8090/command \
  -H 'Content-Type: application/json' \
  -d '{"target":"broadcast","command":"ARC","level":178,"state":"ON","fadeTime":1}'
```

照明が反応すれば DALI 側は完了。

---

## 6. アプリ側の環境変数

`.env.local`（ローカル）または Vercel → Settings → Environment Variables に設定します。
設定後、ローカルは再起動、Vercel は **Redeploy** で反映。

### 共通

| 変数名 | 説明 | 例 |
|--------|------|-----|
| `LIGHTING_BACKEND` | `auto`/`zigbee`/`dali`/`both`/`simulation` | `auto` |

`auto` は設定済みのものを自動採用（両方設定なら `both`）。未設定/未到達なら自動でシミュレーション。

### Zigbee

| 変数名 | 例 |
|--------|-----|
| `ZIGBEE_MQTT_URL` | `mqtt://192.168.1.50:1883` |
| `ZIGBEE_MQTT_USERNAME` / `ZIGBEE_MQTT_PASSWORD` | `lumina` / `********` |
| `ZIGBEE_BASE_TOPIC` | `zigbee2mqtt` |
| `ZIGBEE_DEVICES` | `{"all":"lumina_all","living":"lumina_living",...}` |

### DALI-2

| 変数名 | 例 |
|--------|-----|
| `DALI_GATEWAY_URL` | `http://192.168.1.60`（またはアダプタ `http://server:8090`） |
| `DALI_GATEWAY_TOKEN` | （任意の Bearer トークン） |
| `DALI_COMMAND_PATH` / `DALI_HEALTH_PATH` | `/command` / `/status` |
| `DALI_DEVICES` | `{"all":"broadcast","living":"group:0",...}` |

> アプリは Node ランタイムで動作します。Zigbee は `mqtt` パッケージ（`package.json` に追加済み）、
> DALI は標準 `fetch` を使用します。

---

## 7. ネットワーク構成（クラウド配信時の要点）

アプリを **Vercel 等のクラウド**に置く場合、クラウドから宅内のブローカー/ゲートウェイへは直接到達できません。

- **方式A（推奨・シンプル）：アプリも宅内サーバーで動かす**
  同一LAN内の `mqtt://localhost:1883` / `http://localhost:8090` に接続。遅延最小。
- **方式B：セキュアトンネル** … Tailscale / Cloudflare Tunnel で宅内へ到達。
- **方式C：TLS付き限定公開** … `mqtts://`(8883) / HTTPS＋強固な認証・許可IP限定。上級者向け。

> **1883 / DALIゲートウェイのポートをインターネットに直接開放しない**でください。

---

## 8. トラブルシューティング

| 症状 | 確認ポイント |
|------|--------------|
| バッジが「シミュレーション」のまま | `LIGHTING_BACKEND` と各 URL を確認。`auto` は設定済みのものを採用 |
| 「接続中」から進まない | ファイアウォール・認証情報・URLスキーム（`mqtt://` / `http://`）を確認 |
| Zigbee で反応しない | `friendly_name` と `ZIGBEE_DEVICES` の綴り一致。`mosquitto_pub` で直叩き |
| DALI で反応しない | ゲートウェイIP到達性、`DALI_DEVICES` のアドレス、コミッショニング（group割当）を確認 |
| 明るさが粗い・ちらつく | Zigbee：調光方式の一致。DALI：ドライバが DALI-2 調光対応か |
| 一部ゾーンだけ無反応 | 該当デバイスの名前/グループ所属、Zigbee電波 or DALIバス配線を確認 |

ログ：

```bash
journalctl -u zigbee2mqtt -f                                   # Zigbee2MQTT
mosquitto_sub -h localhost -u lumina -P *** -t 'zigbee2mqtt/#' -v
curl http://<サーバー>:8090/status                              # DALIアダプタ疎通
```

---

## 9. セキュリティ・運用

- `network_key`（Zigbee）、MQTT/DALI の認証情報、`.env.local` は**絶対に Git にコミットしない**。
- ゲストには認証情報を一切共有しない（接続はアプリが自動で行う）。
- 操作はアプリ側で**滞在中フェーズのみ**許可（予約済・滞在後は送信しません）。
- Zigbee2MQTT / Mosquitto / ゲートウェイ / OS を定期的にアップデート。

---

### 参考リンク

- Zigbee2MQTT – MQTT トピックとメッセージ: <https://www.zigbee2mqtt.io/guide/usage/mqtt_topics_and_messages.html>
- Zigbee2MQTT – インストール: <https://www.zigbee2mqtt.io/guide/installation/>
- DALI（DiiA 公式）: <https://www.dali-alliance.org/>
- Lunatone DALI-2 製品: <https://www.lunatone.com/en/product-category/dali/>
- dali2mqtt: <https://github.com/dgomes/dali2mqtt>
- OLEDWorks Brite 3: <https://www.oledworks.com/oled-lighting-products/brite-3/>
