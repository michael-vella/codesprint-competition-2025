import pandas as pd


def load_csv_data() -> pd.DataFrame:
    df = pd.read_csv('data/sample_data.csv')

    df.rename(columns={
        "Unnamed: 0": "date_str",
        "amount": "amount",
        "description": "description",
        "type": "type"
    }, inplace=True)

    df["date"] = pd.to_datetime(df["date_str"]).dt.date

    return df[[
        "date_str",
        "date",
        "amount",
        "description",
        "type",
    ]]

def classify_category(description: str) -> str:
    # rule based classification for categories
    # ideally we use some form of NLP or ML model for this, but for simplicity we use a rule based approach
    food_keywords = ["mcdonald", "deli", "lidl", "domino", "starbucks"]
    entertainment_keywords = ["bookstore", "concert", "gamestore", "cinema"]
    subscription_keywords = ["spotify", "netflix"]
    rent_utilities_keywords = ["dpz", "monthlyren"]  # assumption: dpz is some form of utilities
    shopping_keywords = ["zara", "amazon", "amzn", "tech store"]
    transport_keywords = ["parking", "publicparkin", "parkinggar"]
    
    description_lower = description.lower()
    
    # Check if description contains any of the keywords
    if any(keyword in description_lower for keyword in food_keywords):
        return "Food & Groceries"
    elif any(keyword in description_lower for keyword in entertainment_keywords):
        return "Entertainment"
    elif any(keyword in description_lower for keyword in subscription_keywords):
        return "Subscriptions"
    elif any(keyword in description_lower for keyword in rent_utilities_keywords):
        return "Rent & Utilities"
    elif any(keyword in description_lower for keyword in shopping_keywords):
        return "Shopping"
    elif any(keyword in description_lower for keyword in transport_keywords):
        return "Transport"
    else:
        return "Other"