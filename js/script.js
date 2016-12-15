var lightness = "95%";
var clockTimeout;
var hourFormat = "HH:mm";

$(document).ready(function() {
  if(localStorage.pinnedColour){
    $("body").css('background-color', localStorage.pinnedColour); //set color
    $("#pin_colour_link").addClass("pinned");
  } else
    // gen2();
    changeColor();
    
  ls.get({
    twentyfourhourclock: true,
    showClock: true,
  }, function(st){
    hourFormat = st.twentyfourhourclock ? "HH:mm" : "h:mm A";
    if(st.showClock){
      $("#clock, #hr_link").show();
      clock();
    } else
      // Nothing
      $("#clock, #hr_link").hide();
  });
  
  $("#settings_link").on("click", function(){
    chrome.runtime.openOptionsPage();
  });
  
  $("#clock_link").on("click", function(){
    ls.get({showClock: true}, function(st){
      st.showClock = !st.showClock;
      ls.set({showClock: st.showClock}, function(){
        if(!chrome.runtime.lastError){
          if(clockTimeout) clearTimeout(clockTimeout);
          
          if(st.showClock){
            $("#clock, #hr_link").show();
            clock();
          } else
            $("#clock, #hr_link").hide();
          
        }
      })
    })
  });
  
  $("#hr_link").on("click", function(){
    ls.get({twentyfourhourclock: true}, function(st){
      ls.set({twentyfourhourclock: !st.twentyfourhourclock}, function(){
        if(!chrome.runtime.lastError){
          hourFormat = !st.twentyfourhourclock ? "HH:mm" : "h:mm A";
          if(clockTimeout) clearTimeout(clockTimeout);
          clock();
        }
      })
    })
  });
  
  $("#pin_colour_link").on("click", function(){
    ls.get({pinnedColour: ""}, function(st){
      
      if(st.pinnedColour){
        
        ls.remove("pinnedColour");
        localStorage.removeItem("pinnedColour");
        // $("#pin_colour_link").removeClass("pinned")
        
      } else {
        
        var bgcolor = $("body").css("background-color");
        ls.set({pinnedColour: bgcolor});
        localStorage.pinnedColour = bgcolor;
        // $("#pin_colour_link").addClass("pinned");
        
      }
    });
  });
  
  
});


chrome.storage.onChanged.addListener(function(changes, area){
  if(changes.twentyfourhourclock){
    hourFormat = changes.twentyfourhourclock.newValue && changes.twentyfourhourclock.newValue === true ? "HH:mm" : "h:mm A";
    if(clockTimeout) clearTimeout(clockTimeout);
    clock();
  }
  
  if(changes.showClock){
    if(clockTimeout) clearTimeout(clockTimeout);
    
    if(changes.showClock.newValue && changes.showClock.newValue === true){
      $("#clock, #hr_link").show();
      clock();
    } else 
      $("#clock, #hr_link").hide();
  }
  
  if(changes.pinnedColour){
    if(changes.pinnedColour.newValue){
      $("body").css('background-color', localStorage.pinnedColour); //set color
      $("#pin_colour_link").addClass("pinned");
    } else {
      // gen2();
      changeColor();
      $("#pin_colour_link").removeClass("pinned");
    }
  }
  
});



function clock() {
  $('#clock').html(moment().format(hourFormat));
  clockTimeout = setTimeout(function() { clock(); }, 500);
}


function changeColor() {
  var col = parseInt(Math.random() * 360); //randomize color
  
  $("body").css('background-color', 'hsl(' + col + ', 100%, ' + lightness + ')'); //set color
  
  var hex = '#' + tinycolor('hsl(' + col + ', 100%, ' + lightness + ')').toHex(); //translate to hex
  console.log("changeColor", hex);
}


// function generateRandomColor(mix) {
//   var red = Math.random()*256;
//   var green = Math.random()*256;
//   var blue = Math.random()*256;
  
//   mix = mix || {
//     red: 255,
//     green: 255,
//     blue: 255,
//   }
  
//   // mix the color
//   red = Math.floor((red + mix.red) / 2);
//   green = Math.floor((green + mix.green) / 2);
//   blue = Math.floor((blue + mix.blue) / 2);
  
//   var colorString = "#" + red.toString(16) + green.toString(16) + blue.toString(16);
  
//   console.log("generateRandomColor", colorString);
//   $("body").css("background-color", colorString); //set color
  
//   // Color color = new Color(red, green, blue);
//   // return color;
// }


function gen2(s,v){
  s = s || (0.2 + Math.random()*0.3); //0.2 - 0.50
  v = v || (0.9 + Math.random()*0.1); //0.9 - 1.00
  
  var golden_ratio_conjugate = 0.618033988749895;
  var h = Math.random(); // use random start value
  
  var multiplier = (Math.random()+0.5)%1+Math.random()
  h += golden_ratio_conjugate*(multiplier < 0.67 ? 0 : multiplier > 1.33 ? 2 : 1);
  h %= 1;
  var retCol = HSVtoRGB(h, s || 0.3, v || 0.99);
  
  var iLuma = 0.2126 * retCol.r + 0.7152 * retCol.g + 0.0722 * retCol.b; // per ITU-R BT.709
  
  if(iLuma > 240)
    gen2();
  else {
    var colorString = "#" + parseInt(retCol.r).toString(16) + parseInt(retCol.g).toString(16) + parseInt(retCol.b).toString(16);
    $("body").css("background-color", colorString); //set color
    console.log("gen2", colorString, parseInt(iLuma), "hsv(" + parseInt(h*360) + ", " + parseInt(s*100) + ", " + parseInt(v*100) + ")");
  }
}

// Divide h/360, s&v/100
function HSVtoRGB(h, s, v) {
  var r, g, b, i, f, p, q, t;
  
  if(arguments.length === 1) {
    s = h.s, v = h.v, h = h.h;
  }
  
  i = Math.floor(h * 6);
  f = h * 6 - i;
  p = v * (1 - s);
  q = v * (1 - f * s);
  t = v * (1 - (1 - f) * s);
  switch (i % 6) {
    case 0: r = v, g = t, b = p; break;
    case 1: r = q, g = v, b = p; break;
    case 2: r = p, g = v, b = t; break;
    case 3: r = p, g = q, b = v; break;
    case 4: r = t, g = p, b = v; break;
    case 5: r = v, g = p, b = q; break;
  }
  
  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  };
}


// function pastelColors(){
//   var r = (Math.floor(Math.random()* 128) + 127).toString(16);
//   var g = (Math.floor(Math.random()* 128) + 127).toString(16);
//   var b = (Math.floor(Math.random()* 128) + 127).toString(16);
//   var color = '#' + r + g + b;
  
//   var iLuma = 0.2126 * parseInt(r, 16) + 0.7152 * parseInt(g, 16) + 0.0722 * parseInt(b, 16); // per ITU-R BT.709
  
//   if(iLuma > 155 && iLuma < 250){
//     console.log("pastelColors", color, parseInt(iLuma));
//     $("body").css("background-color", color); //set color
//   } else
//     pastelColors();
// }


// function fnGetRandomColour(iDarkLuma, iLightLuma){
//   var sColour, rgb, r, g, b, iLuma;
  
//   for (var i=0; i<20; i++){
    
//     sColour = ('ffffff' + Math.floor(Math.random() * 0xFFFFFF).toString(16)).substr(-6);
    
//     rgb = parseInt(sColour, 16);   // convert rrggbb to decimal
//     r = (rgb >> 16) & 0xff;  // extract red
//     g = (rgb >>  8) & 0xff;  // extract green
//     b = (rgb >>  0) & 0xff;  // extract blue
    
//     iLuma = 0.2126 * r + 0.7152 * g + 0.0722 * b; // per ITU-R BT.709
    
//     if(iLuma > iDarkLuma && iLuma < iLightLuma)
//       break;
//   }
  
//   console.log("fnGetRandomColour", "#"+sColour);
//   $("body").css("background-color", "#"+sColour); //set color  
// } 
