// var lightness = "84%";
// var saturation = "94%";
// var lightness = "90%";
// var saturation = "95%";

// function gen2(s,v){
//   s = s || (0.2 + Math.random()*0.3); //0.2 - 0.50
//   v = v || (0.9 + Math.random()*0.1); //0.9 - 1.00
  
//   let golden_ratio_conjugate = 0.618033988749895;
//   let h = Math.random(); // use random start value
  
//   let multiplier = (Math.random()+0.5)%1+Math.random()
//   h += golden_ratio_conjugate*(multiplier < 0.67 ? 0 : multiplier > 1.33 ? 2 : 1);
//   h %= 1;
//   let retCol = HSVtoRGB(h, s || 0.3, v || 0.99);
  
//   let iLuma = 0.2126 * retCol.r + 0.7152 * retCol.g + 0.0722 * retCol.b; // per ITU-R BT.709
  
//   if(iLuma > 240)
//     gen2();
//   else {
//     let colorString = "#" + parseInt(retCol.r).toString(16) + parseInt(retCol.g).toString(16) + parseInt(retCol.b).toString(16);
//     $("body").css("background-color", colorString); //set color
//     console.log("gen2", colorString, parseInt(iLuma), "hsv(" + parseInt(h*360) + ", " + parseInt(s*100) + ", " + parseInt(v*100) + ")");
//   }
// }

// sb2sl({h: 312, s: 0.3, b: 0.99});
// sl2sb({h: 312, s: 1, l: 0.95});

// function sl2sb(SL) {
//   let SB = {h: SL.h};
//   let t = SL.s * (SL.l<0.5 ? SL.l : 1-SL.l);
//   SB.v = SL.l+t;
//   SB.s = SL.l>0 ? 2*t/SB.v : SB.s ;
//   console.log(SB);
// }

// function sb2sl(SB) {
//   let SL = {h: SB.h};
//   SL.l = (2 - SB.s) * SB.b / 2;
//   SL.s = SL.l&&SL.l<1 ? SB.s*SB.b/(SL.l<0.5 ? SL.l*2 : 2-SL.l*2) : SL.s;
//   console.log(SL);
// }


// Divide h/360, s&v/100
// function HSVtoRGB(h, s, v) {
//   let r, g, b, i, f, p, q, t;
  
//   if(arguments.length === 1) {
//     s = h.s, v = h.v, h = h.h;
//   }
  
//   i = Math.floor(h * 6);
//   f = h * 6 - i;
//   p = v * (1 - s);
//   q = v * (1 - f * s);
//   t = v * (1 - (1 - f) * s);
//   switch (i % 6) {
//     case 0: r = v, g = t, b = p; break;
//     case 1: r = q, g = v, b = p; break;
//     case 2: r = p, g = v, b = t; break;
//     case 3: r = p, g = q, b = v; break;
//     case 4: r = t, g = p, b = v; break;
//     case 5: r = v, g = p, b = q; break;
//   }
  
//   return {
//     r: Math.round(r * 255),
//     g: Math.round(g * 255),
//     b: Math.round(b * 255)
//   };
// }


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


// function pastelColors(){
//   var r = (Math.floor(Math.random()* 128) + 127).toString(16);
//   var g = (Math.floor(Math.random()* 128) + 127).toString(16);
//   var b = (Math.floor(Math.random()* 128) + 127).toString(16);
//   var color = "#" + r + g + b;
  
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
    
//     sColour = ("ffffff" + Math.floor(Math.random() * 0xFFFFFF).toString(16)).substr(-6);
    
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
