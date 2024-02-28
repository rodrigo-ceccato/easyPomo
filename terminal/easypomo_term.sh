#!/bin/bash

url='https://easypomo.duckdns.org:443/json-endpoint'

# Function to get online step
get_online_step() {
    response=$(curl -s --max-time 5 "$url")
    if [ $? -ne 0 ]; then
        echo "📡❌"
        return
    fi

    # Parse JSON and extract values
    pomo_count=$(echo "$response" | jq '.pomoCount')
    curr_time=$(echo "$response" | jq '.currTime')
    is_resting=$(echo "$response" | jq '.isResting')
    is_long_resting=$(echo "$response" | jq '.isLongResting')
    pomos_before_long_rest=$(echo "$response" | jq '.pomosBeforeLongRest')

    # Format currTime as MM:SS with leading zeros
    minutes=$((curr_time / 60))
    seconds=$((curr_time % 60))
    formatted_time=$(printf '%02d:%02d' $minutes $seconds)

    if [[ $is_resting == "true" ]]; then
        if [[ $is_long_resting == "true" ]]; then
            status_icon="🚬☕"
        else
            status_icon="☕"
        fi
    else
        status_icon="⌛"
    fi

    # Increment pomo_count by 1 for display
    display_pomo_count=$((pomo_count + 1))

    status_string="${display_pomo_count}${status_icon} ${formatted_time}"

    if [[ $is_long_resting == "true" ]]; then
        status_string="${status_icon} ${formatted_time}"
    fi

    echo "$status_string"
}

# Call the function
get_online_step

