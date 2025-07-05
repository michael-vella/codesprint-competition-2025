from flask import Flask, jsonify

from helpers import load_csv_data, classify_category

app = Flask(__name__)

@app.route('/', methods=['GET'])
def load_csv():
    df = load_csv_data()
    data = df.to_dict(orient='records')
    return jsonify(data=data)

@app.route("/expenses", methods=["GET"])
def get_expenses():
    df = load_csv_data()
    expenses_data = df[df['type'] == 'debit']
    # classify categories
    expenses_data['category'] = expenses_data['description'].apply(classify_category)
    expenses = expenses_data.to_dict(orient='records')
    return jsonify(expenses=expenses)

@app.route("/refunds", methods=["GET"])
def get_refunds():
    df = load_csv_data()
    
    # filter where type is 'credit' and description does not contain 'payroll'
    refunds_data = df[
        (df['type'] == 'credit') & 
        (~df['description'].str.contains('payroll', case=False, na=False))
    ]
    
    refunds = refunds_data.to_dict(orient='records')
    return jsonify(refunds=refunds)

@app.route("/income", methods=["GET"])
def get_income():
    df = load_csv_data()
    
    # filter where type is 'credit' and description contains 'payroll'
    income_data = df[
        (df['type'] == 'credit') & 
        (df['description'].str.contains('payroll', case=False, na=False))
    ]
    
    income = income_data.to_dict(orient='records')
    return jsonify(income=income)

if __name__ == '__main__':
    app.run(debug=True)