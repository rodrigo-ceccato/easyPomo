#!.venv/bin/python

import requests
import json
import time
from datetime import timedelta

def get_online_step():
    url = 'https://easypomo.duckdns.org:443/json-endpoint'
    
    try:
        response = requests.get(url)
        response.raise_for_status()  # Raise an HTTPError for bad responses
        data = response.json()

        pomo_count = data["pomoCount"]
        curr_time = data["currTime"]
        is_resting = data["isResting"]
        is_long_resting = data["isLongResting"]

        # Format currTime as MM:SS with leading zeros
        minutes, seconds = divmod(curr_time, 60)
        formatted_time = f'{int(minutes):02d}:{int(seconds):02d}'

        status_icon = "⌛" if not is_resting else "☕" if is_long_resting else "☕"

        print(f'{pomo_count+1}{status_icon} {formatted_time}')

    except requests.exceptions.RequestException as e:
        print(f'EasyPomo failed')

#while True:
#    get_online_step()
#    time.sleep(0.5)
get_online_step()
