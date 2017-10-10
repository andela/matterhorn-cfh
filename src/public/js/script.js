(function (e) {

      $('.emojiable-option').emojiPicker({
        width: '400px',
        height: '200px'
      });

    
        $('.chat').hide();
        $('.chat-message-counter').show();            
        
        $('#live-chat header').on('click', function () {
            $('.chat').slideToggle(300, 'swing');
            var indicator = $( "div.chat-close" ).text();

            if(indicator === '^'){
                $( "div.chat-close" ).text('V');                
                
            } else {
                $( "div.chat-close" ).text('V');
            }
            
    
        });
    
    })();