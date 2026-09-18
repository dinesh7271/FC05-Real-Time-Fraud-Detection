import pandas as pd
import numpy as np
import os

def generate_fraud_dataset(n_samples=10000):
    print(f"Generating {n_samples} synthetic transactions...")

    np.random.seed(42)

    # Feature 1: amount (float)
    # Normal: Log-normal distribution, Fraud: High shifts
    amounts = np.random.lognormal(mean=4, sigma=1, size=n_samples)

    # Feature 2: transaction_hour (int 0-23)
    hours = np.random.randint(0, 24, size=n_samples)

    # Feature 3: new_device (0 or 1)
    new_device = np.random.binomial(1, 0.1, size=n_samples)

    # Feature 4: new_recipient (0 or 1)
    new_recipient = np.random.binomial(1, 0.2, size=n_samples)

    # Feature 5: location_change (0 or 1)
    location_change = np.random.binomial(1, 0.15, size=n_samples)

    # Feature 6: velocity (int)
    velocity = np.random.poisson(lam=1, size=n_samples)

    # Feature 7: account_age_days (int)
    account_age = np.random.randint(1, 3650, size=n_samples)

    # Feature 8: avg_transaction_amount (float)
    # Usually close to the current amount for normal, far for fraud
    avg_amounts = np.random.lognormal(mean=4, sigma=1, size=n_samples)

    df = pd.DataFrame({
        'amount': amounts,
        'transaction_hour': hours,
        'new_device': new_device,
        'new_recipient': new_recipient,
        'location_change': location_change,
        'velocity': velocity,
        'account_age_days': account_age,
        'avg_transaction_amount': avg_amounts
    })

    # Target: is_fraud (0 or 1)
    # Create fraud based on realistic heuristics
    # Fraud if: High amount AND (new_device OR location_change OR unusual hour)
    fraud_prob = np.zeros(n_samples)

    # Heuristic 1: Huge amount relative to avg
    fraud_prob += (df['amount'] > df['avg_transaction_amount'] * 5) * 0.4
    # Heuristic 2: New device + high amount
    fraud_prob += ((df['new_device'] == 1) & (df['amount'] > 1000)) * 0.3
    # Heuristic 3: Location change + new recipient
    fraud_prob += ((df['location_change'] == 1) & (df['new_recipient'] == 1)) * 0.2
    # Heuristic 4: Unusual hour + high velocity
    fraud_prob += ((df['transaction_hour'] < 5) & (df['velocity'] > 3)) * 0.3
    # Heuristic 5: New account + high amount
    fraud_prob += ((df['account_age_days'] < 30) & (df['amount'] > 500)) * 0.2

    # Clip probability and convert to binary target (approx 5-10% fraud)
    df['is_fraud'] = (fraud_prob > 0.6).astype(int)

    # Ensure we have at least some fraud cases
    if df['is_fraud'].sum() == 0:
        df.loc[np.random.choice(df.index, 100), 'is_fraud'] = 1

    print(f"Dataset generated. Fraud distribution: {df['is_fraud'].value_counts(normalize=True)}")

    # Save to data/
    os.makedirs('data', exist_ok=True)
    df.to_csv('data/fraud_dataset.csv', index=False)
    print("Dataset saved to data/fraud_dataset.csv")

if __name__ == "__main__":
    generate_fraud_dataset()
