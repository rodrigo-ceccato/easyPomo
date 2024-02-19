#!.venv/bin/python

import requests
import json
import time
from datetime import timedelta

def get_online_step():
    url = 'https://easypomo.duckdns.org:443/json-endpoint'
    
    try:
        # Set the timeout parameter to 5 seconds
        response = requests.get(url, timeout=5)
        response.raise_for_status()  # Raise an HTTPError for bad responses
        data = response.json()

        pomo_count = data["pomoCount"]
        curr_time = data["currTime"]
        is_resting = data["isResting"]
        is_long_resting = data["isLongResting"]
        pomos_before_long_rest = data["pomosBeforeLongRest"]

        # Format currTime as MM:SS with leading zeros
        minutes, seconds = divmod(curr_time, 60)
        formatted_time = f'{int(minutes):02d}:{int(seconds):02d}'

        status_icon = "⌛" if not is_resting else "🚬☕" if is_long_resting else "☕"

        if is_long_resting or is_resting:
            pomo_count = pomo_count - 1

        status_string = f'{pomo_count+1}{status_icon} {formatted_time}' 

        if is_long_resting:
            status_string = f'{status_icon} {formatted_time}' 

        print(status_string)

    except requests.exceptions.Timeout:
        # Print an emoji indicating the network is not reachable
        print("📡❌")
    except requests.exceptions.RequestException as e:
        print(f'EasyPomo failed')

#while True:
#    get_online_step()
#    time.sleep(0.5)
get_online_step()
