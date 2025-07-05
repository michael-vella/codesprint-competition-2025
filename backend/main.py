from flask import Flask, jsonify, request
from flask_cors import CORS

from helpers import load_csv_data, classify_category
from mock_whatsapp import MockWhatsAppServer

app = Flask(__name__)
CORS(app)

whatsapp_server = MockWhatsAppServer()
whatsapp_server.init("demoUser", "demoPassword") # in production, you would not hardcode credentials like this but retrieve from a secure source

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

@app.route('/send-whatsapp', methods=['POST'])
def send_whatsapp_message():
    data = request.get_json()
    message = data.get('message')

    if not message:
        return jsonify({"error": "No message provided"}), 400

    response = whatsapp_server.send_message(message)
    return jsonify({"status": "success", "response": response})

if __name__ == '__main__':
    app.run(debug=True)