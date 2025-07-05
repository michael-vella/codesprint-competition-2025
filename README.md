# SmartSave - Personal Savings Assistant

## Project Information

SmartSave is a comprehensive personal finance management application designed to help users track their spending, analyze financial patterns, and achieve their savings goals. The application consists of a Python Flask backend API and a JavaScript frontend interface.

### Backend Functionality

The backend is built with **Flask** and provides a RESTful API for financial data management:

- **Data Processing**: Loads and processes CSV transaction data using pandas.
- **Category Classification**: Automatically categorizes transactions using rule-based classification (Food & Groceries, Entertainment, Subscriptions, Rent & Utilities, Shopping, Transport, Other).
- **API Endpoints**:
  - `/` - Returns all transaction data
  - `/expenses` - Returns categorized expense transactions (debit transactions)
  - `/refunds` - Returns refund transactions (credits excluding payroll)
  - `/income` - Returns income transactions (payroll credits)
  - `/send-whatsapp` - Mock whatsapp endpoint that accepts messages and saves to TXT file (instead of sending actual WhatsApp message).
- **CORS Support**: Enables cross-origin requests from the frontend

### Frontend Functionality

The frontend is a modern **vanilla JavaScript** Single Page Application (SPA) featuring:

#### Core Features:
- **Dashboard**: Interactive financial overview with summary cards, charts, and transaction history.
- **Savings Goals**: Goal creation, progress tracking, and savings potential analysis. Progress tracking also contains smart alerts that will notify the user when he is close to achieving his savings goal to encourage him to keep going. Moreover, a mock of WhatsApp has been created on the backend that instead of saving messages, sends to a TXT file.
- **Financial Bot**: AI-powered assistant using OpenAI API for personalized financial advice.

#### Key Components:
- **Interactive Charts**: Category breakdowns (pie charts) and monthly trends (line charts) using Chart.js.
- **Transaction Management**: Filterable transaction history with search and category filters.
- **Local Storage**: Client-side data persistence for savings goals and chat history.

## Project Setup

Follow these steps to set up and run the SmartSave application:

### Prerequisites

- Working Python version (preferably Python 3.7 or higher). 
- Modern web browser (Chrome, Firefox, Safari, Edge)
- OpenAI API key (optional, for AI assistant functionality)

### Backend Setup

1. **Navigate to the project directory**:
   ```bash
   cd codesprint-competition-2025
   ```

2. **Create Python virtual environment**:
   ```bash
   python -m venv .venv
   ```

3. **Activate the virtual environment**:
   
   **Windows:**
   ```bash
   .venv\Scripts\activate
   ```
   
   **macOS/Linux:**
   ```bash
   source .venv/bin/activate
   ```

4. **Install required packages**:
   ```bash
   pip install -r backend/requirements.txt
   ```
   
   This will install:
   - Flask (web framework)
   - Flask-CORS (cross-origin resource sharing)
   - Pandas (data processing)

5. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```

6. **Start the Flask development server**:
   ```bash
   python main.py
   ```
   
   The backend server will start running on `http://localhost:5000`

### Frontend Setup

1. **Open the application in your web browser**:
   - Double-click on `index.html` file
   - Or right-click and select "Open with" → your preferred browser


### Configuration

1. **Verify Backend Connection**: 
   - The application will automatically try to connect to `http://localhost:5000`
   - If successful, you'll see the dashboard with financial data.
   - If connection fails, ensure the Flask server is running.

2. **AI Assistant Setup** (Optional):
   - Navigate to the "FinBot" section.
   - Enter your OpenAI API key when prompted.
   - Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys).

### Usage

1. **Dashboard**: View your financial overview, spending categories, and transaction history.
2. **Savings Goals**: Create and track progress toward your financial goals.
3. **FinBot**: Chat with the AI assistant about your spending patterns and get personalized advice.

### Troubleshooting

- **Backend not starting**: Ensure you're in the correct directory and virtual environment is activated.
- **Frontend not loading data**: Check that the Flask server is running on port 5000.
- **AI assistant not working**: Verify your OpenAI API key is valid and properly entered.
- **Charts not displaying**: Ensure JavaScript is enabled in your browser.

### Deactivating Environment

When you're done working with the project:

```bash
.venv\Scripts\deactivate  # Windows
# or
deactivate  # macOS/Linux
```