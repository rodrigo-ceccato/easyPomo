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
    short_rest_time=$(echo "$response" | jq '.shortRestTime')
    long_rest_time=$(echo "$response" | jq '.longRestTime')

    # Determine remaining time for the current phase
    if [[ $is_resting == "true" ]]; then
        if [[ $is_long_resting == "true" ]]; then
            remaining_time=$((long_rest_time - curr_time))
            status_icon="🚬☕"
        else
            remaining_time=$((short_rest_time - curr_time))
            status_icon="☕"
        fi
    else
        # For focus time, this logic remains unchanged
        remaining_time=$curr_time
        status_icon="⌛"
    fi

    # Format remaining_time as MM:SS with leading zeros
    minutes=$((remaining_time / 60))
    seconds=$((remaining_time % 60))
    formatted_time=$(printf '%02d:%02d' $minutes $seconds)

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
