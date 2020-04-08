#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Sat Apr  4 15:39:15 2020

@author: naviyamakhija
"""
import csv
from datetime import datetime
import pytz

def calculate_sevr(time, measured_temp, outside_temp):
    '''
    Calculates (required temperature - measured temperature),
    taking into account the time to adjust required temp.
    Returns 0 if measured_temp is not a violation
    :type time: datetime
    :type measured_temp: int
    :type outside_temp: int (optional for nighttime)
    '''
    measured_temp = int(measured_temp)
    try:
        outside_temp = int(outside_temp)
    except Exception:
        outside_temp = None
    diff = 0
    day = [hr for hr in range(6, 22)] # day: 6 AM - 10 PM
    night = [22, 23, 0, 1, 2, 3, 4, 5] # night: 10 PM - 6 AM
    if time.hour in day:
        if not outside_temp:
            # Daytime calculation requires outside_temp, but csv files sometimes don't
            # satisfy this condition so treating not-enough-info as just non-violationf or now
            pass
            # raise ValueError('Daytime calculation requires outside_temp information')
        elif outside_temp < 55:
            required_temp = 68
            diff = required_temp - measured_temp
        else:
            # Not a violation
            pass
        
    if time.hour in night:
        required_temp = 62
        diff = required_temp - measured_temp
    
    # Turning non-violating diff's into 0 
    if diff < 0:
        diff = 0
        
    return diff

def write_severity(path, write_path):
    """
    with open('heatseek_geocoded_severity.csv', 'w+', newline='') as file:
        writer = csv.writer(file)
        writer.writerow(["UserID", "Violation", "Severity"])
        for point in severity_points:
            writer.writerow(point)
    """
    with open(path, 'r') as read_obj, \
        open(write_path, 'w', newline='') as write_obj:
        # Create a csv.reader object from the input file object
        csv_reader = csv.reader(read_obj)
        # Create a csv.writer object from the output file object
        csv_writer = csv.writer(write_obj)
        # Read each row of the input csv file as list
        next(csv_reader)
        csv_writer.writerow(["user_id", "address", "zip_code", "apartment", "sensor_id", "bbl", "temp", "created_at", "outdoor_temp", "violation", "add_full", "lat", "lon", "severity"])
        for row in csv_reader:
            #user_id
            if (row[1].isdigit()):
                row[1] = int(row[1])
            #zip_code
            if (row[3].isdigit()):
                row[3] = int(row[3])
            #sensor_id
            if (row[5].isdigit()):
                row[5] = int(row[5])
            #temp
            if (row[7].isdigit()):
                row[7] = int(row[7])
            #outdoor_temp
            if (row[9].isdigit()):
                row[9] = int(row[9])
            #created_at
            row[8] = datetime.strptime(row[8], "%Y-%m-%d %H:%M:%S")
            #UTC to EST/EDT
            row[8] = row[8].replace(tzinfo=pytz.utc)
            row[8] = row[8].astimezone(pytz.timezone('US/Eastern'))
            if row[10].lower() == 'true':
                row[10] = True
            elif row[10].lower() == 'false':
                row[10] = False
            else:
                raise ValueError('unexpected value for violation')
            # Append the severity to each row
            row.append(calculate_sevr(row[8], row[7], row[9]))
            # Add the updated row / list to the output file
            #remove the extraneous column
            row = row[1:]
            csv_writer.writerow(row)
 
path = "../../CSEG Tech - Heat Seek Data Visualization/data/heatseek_geocoded.csv"
write_path = "../../CSEG Tech - Heat Seek Data Visualization/data/heatseek_geocoded_severity.csv"
write_severity(path, write_path)