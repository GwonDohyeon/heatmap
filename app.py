from flask import Flask, jsonify, render_template
import pandas as pd
from datetime import datetime

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/get_heatmap_data')
def get_heatmap_data():
    # Reading data from the CSV file
    data_df = pd.read_csv("static/data/DJI_data.csv")

    # Convert '날짜' column to datetime (make sure the column exists)
    data_df['Date'] = pd.to_datetime(data_df['날짜'])  # Adjust column name if needed
    data_df['종가'] = data_df['종가'].replace({',': ''}, regex=True)  # Remove commas
    data_df['Close'] = pd.to_numeric(data_df['종가'], errors='coerce')  # Convert to numeric
    
    # Remove the '%' symbol and convert '변동 %' column to numeric
    data_df['변동 %'] = data_df['변동 %'].replace({',': '', '%': ''}, regex=True)
    data_df['value'] = pd.to_numeric(data_df['변동 %'], errors='coerce')  # Convert to numeric
    
    # Select only the columns Date, Close, and value
    data_df = data_df[['Date', 'Close', 'value']]

    # Convert the dataframe to a list of dictionaries for JSON response
    data_json = data_df.to_dict(orient='records')
    
    # Return the data as JSON
    return jsonify(data_json)

if __name__ == '__main__':
    app.run(debug=True)
