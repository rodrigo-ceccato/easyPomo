Example of i3-status-rust config:

```
[[block]]
block = "custom"
cycle = ["echo 🤫","easyPomo/terminal/easypomo_term.sh"]
interval = 1
```

> [!IMPORTANT] 
> Before adding it to the i3status-bar config file, adjust the python interpreter shebang of `easypomo_term.py` file.
