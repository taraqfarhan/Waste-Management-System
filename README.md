# Waste Management System — Rajshahi City Corporation

A web-based dashboard to monitor Secondary Transfer Stations (STSs) across Rajshahi City,
with live fill-level tracking, clearance countdowns, and station details.

---

## Project Structure

```
WasteManagementSystem/
│
├── index.html          ← Home/landing page
├── about.html          ← About the STS network
├── stations.html       ← Live station monitoring
├── map.html            ← Geographic map
│
├── css/
│   └── style.css       ← All shared styles
│
├── js/
│   ├── app.js          ← Shared nav helper
│   └── stations.js     ← Station rendering & live timers
│
├── data/
│   └── stations.json   ← Station data (add/edit)
│
└── images/
    ├── rcc_logo.png
    ├── sts1.jpg
    └── .....           ← (others added as needed)
```

---

## How to Add a New Station

Open `data/stations.json` and add a new object to the `"stations"` array:

```json
{
  "id": "terakhadia",
  "name": "Terakhadia Secondary Transfer Station",
  "location": "Terakhadia, Rajshahi",
  "image": "images/sts-terakhadia.jpg",
  "clearance_time": "02:00 pm",
  "contact": "+880 721 000003",
  "capacity_tons": 55,
  "ward": "Ward 15"
}
```

Then drop `sts-terakhadia.jpg` into the `images/` folder. That's it — no code changes needed.

### Station fields

| Field            | Required | Description                          |
| ---------------- | -------- | ------------------------------------ |
| `id`             | Yes      | Unique identifier (no spaces)        |
| `name`           | Yes      | Full station name                    |
| `location`       | Yes      | Human-readable address               |
| `image`          | Yes      | Path relative to project root        |
| `clearance_time` | Yes      | Format: `"HH:MM am"` or `"HH:MM pm"` |
| `contact`        | No       | Phone number for the contact button  |
| `capacity_tons`  | No       | Daily capacity in tons               |
| `ward`           | No       | City ward identifier                 |

---

## How to Modify an Existing Station

Edit the relevant object in `data/stations.json`. For example, to change the
clearance time of the Railway station from 1:00 pm to 2:30 pm:

```json
"clearance_time": "02:30 pm"
```

To replace its image, put the new image in `images/` and update the `"image"` field.

---

## Running Locally

Because `stations.js` fetches `stations.json` via `fetch()`, we need a local server
(browsers block `fetch()` on `file://` URLs).

**Option 1 — VS Code Live Server extension** (recommended) <br>
Right-click `index.html` → Open with Live Server.

**Option 2 — Python**

```bash
python -m http.server 8000
# then open http://localhost:8000
```

**Option 3 — Node.js**

```bash
npx serve .
```
