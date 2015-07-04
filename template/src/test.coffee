HtmlComponent.ready ()=>
  $showButton = $('<button>SHOW</button>')
  $hideButton = $('<button>HIDE</button>')
  style =
    display: 'block'
    width: '160px'
    height: '45px'
    margin: '10px'

  $showButton.css style
  $hideButton.css style

  $showButton.on 'click', ()=>
    HtmlComponent.get('${className}')[0].show()

  $hideButton.on 'click', ()=>
    HtmlComponent.get('${className}')[0].hide()

  $body = $(document.body)
  $body.append $showButton
  $body.append $hideButton


