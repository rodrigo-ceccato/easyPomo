var themes = [
    {
      bg: '#222',
      visor: '#002D3C',
      text: '#F5F5F5',
      bars: '#00CCFF'
    },
    {
      bg: '#F44336',
      visor: '#dadada',
      text: '#F5F5F5',
      bars: '#6b6b6b'
    },
    {
      bg: '#333',
      visor: '#222',
      text: '#F5F5F5',
      bars: '#F00'
    }
  ]
  
  function setThemeVar(name, value, unit) {
    var rootStyles = document.styleSheets[0].cssRules[1].style;
    rootStyles.setProperty('--' + name, value + (unit || ''));
  }
  
  var radios = document.querySelectorAll('.radio-inline input');
  for(var i = 0, max = radios.length; i < max; i++) {
      radios[i].onclick = e => {
          var index = parseInt(e.currentTarget.value);
          var theme = themes[index];
  
          barsColor = theme.bars;
          setThemeVar('bg-color', theme.bg);
          setThemeVar('visor-color', theme.visor);
          setThemeVar('text-color', theme.text);
          setThemeVar('bars-color', theme.bars);
      }
  }
  
  radios[1].click();