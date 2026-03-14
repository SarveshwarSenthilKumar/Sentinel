# Fraud Detection

Standalone fraud-model sandbox for the hackathon project.

## What it does

- Streams synthetic banking transactions in real time
- Uses a normalized transaction schema with account, device, IP, beneficiary, geo, novelty, and velocity fields
- Scores suspicious transactions with an isolation-forest-style anomaly detector over engineered behavioral features
- Applies a rule engine for baseline deviation, new device and country, impossible travel, smurfing, shared infrastructure, and rapid multi-hop checks
- Detects fraud rings using circular-transfer, shared-entity, cash-out, and fan-in/fan-out graph heuristics
- Combines `transaction_anomaly_score`, `rule_score`, and `network_risk_score` into a final decision score
- Classifies every event into severity and action: `allow`, `review`, `hold`, or `block`
- Explains alerts in plain language on the dashboard

## Evaluate

Run synthetic precision and recall checks with:

```bash
cd Fraud-Detection
python3 evaluation.py --sample-size 300
```
## Files

- `simulation.py`: synthetic transaction generator using the normalized schema
- `detection.py`: feature engineering, rule engine, anomaly scoring, network scoring, and decision logic
- `evaluation.py`: quick synthetic precision / recall sanity check

## Note

The active website stack now lives in `backend/` and `frontend/`. This folder is kept for the model sandbox and evaluation utilities.
