import pandas as pd
import os

def convert_excel_to_csv(input_path):
    if not os.path.exists(input_path):
        print(f"File {input_path} not found.")
        return
    
    print(f"Reading {input_path}...")
    try:
        # Read the Excel file
        df = pd.read_excel(input_path)
        
        # Define output path
        output_path = input_path.replace(".xlsx", ".csv")
        
        # Save to CSV
        df.to_csv(output_path, index=False, encoding='utf-8-sig')
        print(f"Successfully converted to {output_path}")
    except Exception as e:
        print(f"Error converting file: {e}")

if __name__ == "__main__":
    convert_excel_to_csv("data/floodarchive.xlsx")
