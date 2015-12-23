
function Canvolver(UseUpdateCall, UseUpdateBlock, UseUpdateStatus, UseUnsetConstant, OrigSourceImage, OrigSrcCanvas, NovelCanvas, WinnerCanvas, GenesPerGen, NoisePerGen, MutatePerGen, BonusMutatePerGen, AutumnSpawnPerGen, SpringSpawnPerGen) {

    // private

    var hue = [
    [255,   0,   0 ], // 0, Red,       0°
    [255, 255,   0 ], // 1, Yellow,   60°
    [  0, 255,   0 ], // 2, Green,   120°
    [  0, 255, 255 ], // 3, Cyan,    180°
    [  0,   0, 255 ], // 4, Blue,    240°
    [255,   0, 255 ], // 5, Magenta, 300°
    [255,   0,   0]]; // 6, Red,     360°



    var isRunning  = false;
    var Generation = 0;
    var LastGen;

    var UpdateCall;
    var UpdateBlock;
    var UpdateStatus;
    var UnsetConstant;

    var startTime = 0;

    var GenesPerGenField;
    var NoisePerGenField;
    var MutatePerGenField;
    var BonusMutatePerGenField;
    var AutumnSpawnPerGenField;
    var SpringSpawnPerGenField;

    var tgtContext;
    var tgtCanvas;
    var imageData;

    var srcContext;
    var srcCanvas;
    var srcImageData;

    var novelTgtContext;
    var novelTgtCanvas;
    var novelImageData;

    var BestMatchSoFar;
    var BestMatchId;

    var CurrentDiff;

    var uWidth;
    var uHeight;

    var srcImage;

    var APolyCache = 0;
    var AVertCache = 0;

    var nextId = 0;






    var diffPixel = function(src1, src2, tgt, x, y) {

      index = (x + y * imageData.width) * 4;

      var tdata = tgt.data, s1data = src1.data, s2data = src2.data;

      tdata[index+0] = Math.max(0, Math.min(255, Math.abs(Math.floor(s1data[index+0] - s2data[index+0]))));
      tdata[index+1] = Math.max(0, Math.min(255, Math.abs(Math.floor(s1data[index+1] - s2data[index+1]))));
      tdata[index+2] = Math.max(0, Math.min(255, Math.abs(Math.floor(s1data[index+2] - s2data[index+2]))));
      tdata[index+3] = 255;

    }






    this.iDiff = function(i1, i2, tgt) {

      var ctx1 = i1.getContext('2d');
      var ctx2 = i2.getContext('2d');
      var ctxT = tgt.getContext('2d');

      var iD1 = ctx1.getImageData(0,0, uWidth, uHeight);
      var iD2 = ctx2.getImageData(0,0, uWidth, uHeight);
      var iDT = ctxT.createImageData(uWidth, uHeight);

      for (var w=0; w<uWidth; ++w) {
        for (var h=0; h<uHeight; ++h) {

          diffPixel(iD1, iD2, iDT, w, h);

        }
      }

      ctxT.putImageData(iDT, 0,0);

    }





    var GetBestPolys = function() {
      return APolyCache;
    }





    var GetBestVertices = function() {
      return AVertCache;
    }





    var genId = function() {
      return nextId++;
    }





    var log2 = function(X) {
      return Math.log(X) / Math.log(2);
    }




/*
    var setPixel = function(x, y, r, g, b, a) {

      index = (x + y * imageData.width) * 4;

      imageData.data[index+0] = r;
      imageData.data[index+1] = g;
      imageData.data[index+2] = b;
      imageData.data[index+3] = a;

    }
*/





    var llog = function(X) {

        if (true) { console.log(X); }

    }





    var matchImageSizes = function() {

      var Canvas       = document.getElementById('WinnerCanvas');
      var HCanvas      = document.getElementById('PixelCanvas');
      var NCanvas      = document.getElementById('CurrentCanvas');
      var Controls     = document.getElementById('controls');
      var Breed1       = document.getElementById('BreedCanvas1');
      var Breed2       = document.getElementById('BreedCanvas2');

      var Base         = document.getElementById('BaseGraphic');

      Canvas.width     = Base.width;      Canvas.height    = Base.height;
      HCanvas.width    = Base.width;      HCanvas.height   = Base.height;
      NCanvas.width    = Base.width;      NCanvas.height   = Base.height;
      Breed1.width     = Base.width;      Breed1.height    = Base.height;
      Controls.width   = Base.width;      Controls.height  = Base.height;

      Breed2.style.width  = Base.width.toString()  + 'px';
      Breed2.style.height = Base.height.toString() + 'px';

    }





    var GetBoundedNudge = function(From, By, Lo, Hi) {
      return Math.min(Hi, Math.max(Lo, From+By));
    }





    var Mutate = function(State) {

      State.parentId = State.idc;
      State.idc      = genId();
      State.score    = 1.1;

//      llog('created ' + State.idc.toString() + ' from ' + State.parentId.toString() );

      MovePosition = function(Label, RGBb, Ab) {
        var Which  = rnd(State.Polys.length);
        var WhichC = rnd(4);
        var NC = GetBoundedNudge(State.Polys[Which][1][WhichC], (WhichC == 3)? (Math.random() * Ab) : (rnd(RGBb)), 0, ((WhichC == 3)? 1 : 255) );
        State.Polys[Which][1][WhichC] = NC;
        llog(' - ' + Label + ' (' + RGBb.toString() + '/' + Ab.toString() + ') poly color channel');
      }

      switch (rnd(48)) {

        case 0:
        case 28:
        case 27:
          var WhichC     = rnd(3);
          var Vars       = State.bg.color.split('(')[1].split(')')[0].split(',');
          for (var i=0; i<3; ++i) { Vars[i] = parseInt(Vars[i],10); }
          Vars[WhichC]   = GetBoundedNudge(Vars[WhichC], rnd(180)-90, 0, 255);
          State.bg.color = makeOpaqueColorCssRgbaString(Vars[0], Vars[1], Vars[2]);
//          } else {
//            State.bg.color[WhichC] = GetBoundedNudge(State.bg.color[WhichC], rnd(60), 0, 255);
//          }
          llog(' - changed bg color');
          break;

        case 1:
          State.Polys[rnd(State.Polys.length)][1] = genColor();
          llog(' - replaced poly color');
          break;

        case 2:
        case 29:
        case 30:
        case 31:
          var Which  = rnd(State.Polys.length);
          var WhichC = rnd(4);
          var NC = GetBoundedNudge(State.Polys[Which][1][WhichC], (WhichC == 3)? (Math.random() * 0.1) : (rnd(60)-30), 0, ((WhichC == 3)? 1 : 255) );
          State.Polys[Which][1][WhichC] = NC;
          llog(' - nudged (60) poly color channel');
          break;

        case 3:
          var Which  = rnd(State.Polys.length);
          var WhichC = rnd(4);
          State.Polys[Which][1][WhichC] = GetBoundedNudge(State.Polys[Which][1][WhichC], (WhichC == 3)? (Math.random() * 0.25) : (rnd(120)-60), 0, ((WhichC == 3)? 1 : 255) );
          llog(' - bumped (120) poly color channel');
          break;

        case 4:
          var Which = rnd(State.Polys.length);
          var Where = rnd(State.Polys[Which][0].length);
          State.Polys[Which][0][Where] = [rnd(uWidth), rnd(uHeight)];
          llog(' - changed (rand) poly pointloc');
          break;

        case 5:
        case 32:
        case 33:
        case 38:
        case 39:
        case 40:
        case 41:
        case 42:
          var Which = rnd(State.Polys.length);
          var Where = rnd(State.Polys[Which][0].length);
          State.Polys[Which][0][Where] = [GetBoundedNudge(State.Polys[Which][0][Where][0], rnd(10)-5, 0, uWidth), State.Polys[Which][0][Where][1]];
          llog(' - hnudged (10) poly pointloc');
          break;

        case 6:
        case 34:
        case 35:
        case 43:
        case 44:
        case 45:
        case 46:
        case 47:
          var Which = rnd(State.Polys.length);
          var Where = rnd(State.Polys[Which][0].length);
          State.Polys[Which][0][Where] = [State.Polys[Which][0][Where][0], GetBoundedNudge(State.Polys[Which][0][Where][1], rnd(10)-5, 0, uHeight)];
          llog(' - vnudged (10) poly pointloc');
          break;

        case 7:
          var Which = rnd(State.Polys.length);
          var Where = rnd(State.Polys[Which][0].length);
          State.Polys[Which][0][Where] = [GetBoundedNudge(State.Polys[Which][0][Where][0], rnd(25)-12, 0, uWidth), State.Polys[Which][0][Where][1]];
          llog(' - hbumped (25) poly pointloc');
          break;

        case 8:
          var Which = rnd(State.Polys.length);
          var Where = rnd(State.Polys[Which][0].length);
          State.Polys[Which][0][Where] = [State.Polys[Which][0][Where][0], GetBoundedNudge(State.Polys[Which][0][Where][1], rnd(25)-12, 0, uHeight)];
          llog(' - vbumped (25) poly pointloc');
          break;

        case 9:
          var Which = rnd(State.Polys.length);
          var Where = rnd(State.Polys[Which][0].length);
          State.Polys[Which][0][Where] = [GetBoundedNudge(State.Polys[Which][0][Where][0], rnd(50)-25, 0, uWidth), State.Polys[Which][0][Where][1]];
          llog(' - hthrew (50) poly pointloc');
          break;

        case 10:
          var Which = rnd(State.Polys.length);
          var Where = rnd(State.Polys[Which][0].length);
          State.Polys[Which][0][Where] = [State.Polys[Which][0][Where][0], GetBoundedNudge(State.Polys[Which][0][Where][1], rnd(50)-25, 0, uHeight)];
          llog(' - vthrew (50) poly pointloc');
          break;

        case 11:
          var Which = rnd(State.Polys.length);
          var Where = rnd(State.Polys[Which][0].length);
          State.Polys[Which][0].splice(Where, 0, [State.Polys[Which][0][Where][0] + rnd(10), State.Polys[Which][0][Where][1] + rnd(10)]);  // hax
          llog(' - nearby-added poly point');
          break;

        case 12:
          var Which = rnd(State.Polys.length);
          State.Polys[Which][0][State.Polys[Which][0].length] = [rnd(uWidth), rnd(uHeight)];
          llog(' - added poly point');
          break;

        case 13:
        case 14:
        case 15:
        case 16:
        case 36:
          var Which = rnd(State.Polys.length);
          if (State.Polys[Which][0].length <= 3) {
            llog(' - skipped remove poly point, too small');
          } else {
            State.Polys[Which][0] = State.Polys[Which][0].splice(rnd(State.Polys[Which][0].length), 1);
            llog(' - removed poly point');
          }
          break;

        case 17:
          var Which  = rnd(State.Polys.length);
          var WhichL = rnd(State.Polys[Which][0].length);
          var WhichR = rnd(State.Polys[Which][0].length);
          var H      = WhichL;
          WhichL     = WhichR;
          WhichR     = H
          llog(' - swapped poly points');
          break;

        case 18:
          var WhichL = rnd(State.Polys.length);
          var WhichR = rnd(State.Polys.length);
          var H      = WhichL;
          WhichL     = WhichR;
          WhichR     = H
          llog(' - swapped poly depths');
          break;

        case 19:
        case 20:
        case 21:
        case 22:
          State.Polys.push(genRandPoly());
          llog(' - added a poly');
          break;

        case 23:
          var Which   = rnd(State.Polys.length);
          if (State.Polys[Which][0].length == 0) {
            llog(' - skipped cleave, 0-length');
          } else {
            var WhichL  = rnd(State.Polys[Which][0].length);
            var PointsL = State.Polys[Which][0].slice(0,WhichL);
            var PointsR = State.Polys[Which][0].slice(WhichL);
            var PolyL   = extend(State.Polys[Which]);
            var PolyR   = extend(State.Polys[Which]);
            PolyL[0] = PointsL;
            PolyR[0] = PointsR;
//          State.Polys.splice(Which, 1, PolyL, PolyR);
            llog(' - cleaved a poly');
          }
          break;

        case 24:
        case 25:
        case 37:
          if (State.Polys.length > 1) {
            State.Polys.splice(rnd(State.Polys.length),1);
            llog(' - dropped a poly');
          } else {
            llog(' - skipped drop a poly, too few');
          }
          break;

        case 26:
          State.Polys.push(genRandSpeck());
          llog(' - added a speck');
          break;

//        default : State.Polys[rnd(State.Polys.length)]

      }

    }





    function extend(from, to) {

        if ((from == null)                 || (typeof from != "object"))      { return from; }
        if ((from.constructor != Object)   && (from.constructor != Array))    { return from; }
        if ((from.constructor == Date)     || (from.constructor == RegExp) ||
            (from.constructor == Function) || (from.constructor == String) ||
            (from.constructor == Number)   || (from.constructor == Boolean))  { return new from.constructor(from); }

        to = (to || new from.constructor());

        for (var name in from) {
          to[name] = ((typeof to[name] == "undefined")? extend(from[name], null) : to[name]);
        }

        return to;

    }





    var MutateFromStoreInto = function(HtL, F, I, Depth) {

//    llog('Mutating from ' + F.toString() + ' into ' + I.toString());

      var Q  = extend(HtL[F]);
      Mutate(Q);
      if (Depth != undefined) { for (i=Depth; i>1; --i) { Mutate(Q); }}

//      llog('HtL F idc: ' + HtL[F].idc.toString() + '; Q: ' + Q.idc.toString());

      HtL[I] = Q;
      return;

    }





    var compPixel = function(x, y) {

      index = (x + (y*imageData.width)) * 4;

      var r1 = novelImageData.data[index+0];
      var g1 = novelImageData.data[index+1];
      var b1 = novelImageData.data[index+2];
      var a1 = novelImageData.data[index+3];

      var r2 = srcImageData.data[index+0];
      var g2 = srcImageData.data[index+1];
      var b2 = srcImageData.data[index+2];
      var a2 = srcImageData.data[index+3];

      return (Math.abs(r1-r2) + Math.abs(g1-g2) + Math.abs(b1-b2) + Math.abs(a1-a2)) / (255*4);

    }





    var rnd = function(X) {
      return Math.floor(Math.random() * X);
    }





    var rndNot = function(X,N) {
      var Base = Math.floor(Math.random() * X);
      return (Base >= N)? N+1 : N;
    }





    var setRandomPixel = function() {

      x = parseInt(rnd(uWidth));
      y = parseInt(rnd(uHeight));

      r = parseInt(rnd(256));
      g = parseInt(rnd(256));
      b = parseInt(rnd(256));

      setPixel(x, y, r, g, b, 0xff);            // 0xff opaque

    }





    var placePoly = function(aContext, Points, r, g, b, a) {

    /*
      gradient = tgtContext.createLinearGradient(0, 0, uWidth, 0);
      for (var c=0; c<=6; ++c) {
        color = 'rgb(' + hue[c][0] + ', ' + hue[c][1] + ', ' + hue[c][2] + ')';
        gradient.addColorStop(c * 1/6, color);
      }

      tgtContext.fillStyle = gradient;
    */

      aContext.fillStyle = genColorCssRgbaString(r,g,b,a);
      aContext.beginPath();

      aContext.moveTo(Points[0][0], Points[0][1]);

      for (var i=1; i<Points.length; ++i) { aContext.lineTo(Points[i][0], Points[i][1]); }

      aContext.closePath();
      aContext.fill();

    }





    var makeOpaqueColorCssRgbaString = function(r,g,b) {

      return 'rgba(' + r.toString() + ',' + g.toString() + ',' + b.toString() + ', 1)';

    }





    var genOpaqueColorCssRgbaString = function() {

      return makeOpaqueColorCssRgbaString(rnd(256),rnd(256),rnd(256));

    }





    var genColorCssRgbaString = function(r,g,b,a) {

      return 'rgba(' + r.toString() + ',' + g.toString() + ',' + b.toString() + ',' + a.toString() + ')';

    }





    var genColor = function() {

      return [rnd(256), rnd(256), rnd(256), Math.random()];

    }





    var genOpaqueColor = function() {

      return [rnd(256), rnd(256), rnd(256), 255];

    }





    var genRandPoly = function() {

      var Coords = [];
      var PCount = 3 + (4 - Math.floor(log2(rnd(16)+1)));

      for (var i=0; i<PCount; ++i) { Coords.push([ rnd(uWidth), rnd(uHeight) ]); }

      return [Coords, genColor()];

    }





    var genRandSpeck = function() {

      var Coords = [];

      var x      = rnd(uWidth);
      var y      = rnd(uHeight);

      Coords.push([ x,   y   ]);
      Coords.push([ x+1, y   ]);
      Coords.push([ x,   y+1 ]);

      return [Coords, genColor()];

    }





    var placePackedPoly = function(aContext, Packed) {
      placePoly(aContext, Packed[0], Packed[1][0], Packed[1][1], Packed[1][2], Packed[1][3]);
    }





    var FindLowestN = function(N) {

      // todo comeback

      ar = [];
      for (var i=0; i<N; ++i) { ar.push(i); }

      return ar;

    }





    var DeathPhase = function() {

      var MPG           = getMutationsPerGen();
      var bMPG          = getBonusMutationsPerGen();
      var NPG           = getNoisePerGen();
      var aSPG          = getAutumnSpawnPerGen();
      var sSPG          = getSpringSpawnPerGen();

      var KillCount     = /* NPG + sSPG + aSPG + */ MPG + bMPG;
      var SurvivorCount = getGenesPerGen() - KillCount;

      var HighToLow     = LastGen.slice(0);
      HighToLow.sort(function(a,b) { return b.score - a.score; });

      var KillCursor    = 0;

 //   for (var i=0; i <aSPG; ++i) { ++KillCursor; }

      /* Conceptually, kills "happen" here */

      llog('---');

      for (var i=0; i < MPG; ++i) {
        MutateFromStoreInto(HighToLow, (HighToLow.length-1) - i, KillCursor);
        ++KillCursor;    // todo overwrite problem
      }

      for (var i=0; i <bMPG; ++i) {
        MutateFromStoreInto(HighToLow, (HighToLow.length-1) - i, KillCursor, 3);
        ++KillCursor;    // todo overwrite problem
      }

      HighToLow.sort(function(a,b) { return b.score - a.score; });

//      for (var i=0; i < NPG; ++i) { ++KillCursor; }
//      for (var i=0; i <sSPG; ++i) { ++KillCursor; }

      StateSet = HighToLow;

      llog('===');

      return;

    }





    // public

    this.genRandInitialState = function() {

      return {'Polys':this.makeNoise(), 'idc':genId(), 'bg':{'kind':'solid','color':this.genRgbString()}};

    }





    this.genRandInitialStateSet = function(Count) {

      var set = [];

      for (var i=0; i<Count; ++i) {
        set.push(this.genRandInitialState());
      }

      return set;

    }





    this.genRgbString = function() {

      return 'rgb(' + rnd(256).toString() + ',' + rnd(256).toString() + ',' + rnd(256).toString() + ')';

    }





    this.genRgbaString = function() {

      return 'rgba(' + rnd(256).toString() + ',' + rnd(256).toString() + ',' + rnd(256).toString() + ',' + Math.random().toString() + ')';

    }





    this.measureDifference = function() {

      this.bakeImages();

      var GridSum = 0;
      for (var y = 0; y < uHeight; ++y) {

        var RowSum = 0;
        for (var x = 0; x < uWidth;  ++x) {
          RowSum += compPixel(x,y);
        }

        GridSum += RowSum / uWidth;

      }

      return GridSum / uHeight;

    }





    this.setTgts = function(UseUpdateCall, UseUpdateBlock, UseUpdateStatus, UseUnsetConstant, ToSourceImage, ToSourceCanvas, ToNovelCanvas, ToCanvas, GenesPerGen, NoisePerGen, MutatePerGen, BonusMutatePerGen, AutumnSpawnPerGen, SpringSpawnPerGen) {

      UpdateCall             = UseUpdateCall;
      UpdateBlock            = UseUpdateBlock;
      UpdateStatus           = UseUpdateStatus;
      UnsetConstant          = UseUnsetConstant;

      this.reset();
      matchImageSizes();

      tgtCanvas              = ToCanvas;
      tgtContext             = tgtCanvas.getContext('2d');

      srcCanvas              = ToSourceCanvas;
      srcContext             = srcCanvas.getContext('2d');

      novelTgtCanvas         = ToNovelCanvas;
      novelTgtContext        = novelTgtCanvas.getContext('2d');

      srcImage               = ToSourceImage;

      uWidth                 = srcImage.width;
      uHeight                = srcImage.height;

      var Controls           = document.getElementById('controls');
      Controls.style.width   = uWidth.toString() + 'px';
      Controls.style.height  = uHeight.toString() + 'px';

      imageData              = tgtContext.createImageData(uWidth, uHeight);
      novelImageData         = novelTgtContext.createImageData(uWidth, uHeight);

      srcContext.drawImage(document.getElementById('BaseGraphic'), 0,0);
      srcImageData           = srcContext.getImageData(0,0, uWidth, uHeight);

      GenesPerGenField       = GenesPerGen;
      NoisePerGenField       = NoisePerGen;
      MutatePerGenField      = MutatePerGen;
      BonusMutatePerGenField = BonusMutatePerGen;
      AutumnSpawnPerGenField = AutumnSpawnPerGen;
      SpringSpawnPerGenField = SpringSpawnPerGen;

    }





    this.makeNoise = function() {

      var Polys = [];
      var iC    = 1;

      for (var i=0; i<iC; ++i) { Polys.push(genRandPoly()); }

      return Polys;

    }





    this.bakeImages = function() {

      imageData      = tgtContext.getImageData(0,0, uWidth, uHeight);
      novelImageData = novelTgtContext.getImageData(0,0, uWidth, uHeight);
      srcImageData   = srcContext.getImageData(0,0, uWidth, uHeight);  // not changing

    }





    this.drawPolysTo = function(Polys, aContext, lPolyVtxCache) {

      var lVtxCache = 0;

      for (var j=0; j<Polys.length; ++j) {
        placePackedPoly(aContext, Polys[j]);
        lVtxCache += Polys[j][0].length;
      }

      if (lPolyVtxCache != undefined) { return lPolyVtxCache + lVtxCache; }

    }





    this.runStep = function(i, StateI) {

      novelTgtContext.fillStyle = StateI.bg.color;
      novelTgtContext.fillRect(0,0,uWidth,uHeight);

      var lPolyVtxCache = 0;
      lPolyVtxCache = this.drawPolysTo(StateI.Polys, novelTgtContext, lPolyVtxCache);

      var Difference    = this.measureDifference();
      StateSet[i].score = Difference;
      CurrentDiff       = Difference;

      if (Difference < BestMatchSoFar) {

        lPolyVtxCache = 0;

        tgtContext.fillStyle = StateI.bg.color;
        tgtContext.fillRect(0,0,uWidth,uHeight);

        lPolyVtxCache = this.drawPolysTo(StateI.Polys, tgtContext, lPolyVtxCache);

        if ((Generation % 16) == 1) { this.iDiff(document.getElementById('PixelCanvas'), document.getElementById('WinnerCanvas'), document.getElementById('BreedCanvas1')); }

        BestMatchSoFar = Difference;
        BestMatchId    = i;

        APolyCache     = StateI.Polys.length;
        AVertCache     = lPolyVtxCache;

      }

    }





    this.setRunning = function(nowIsRunning) {

      if (isRunning != nowIsRunning) {
        UpdateBlock(nowIsRunning);
        isRunning = nowIsRunning;
      }

      if (!(nowIsRunning)) { setStatus('Idle' + ((Generation == 0)? '' : ' (completed generation ' + Generation.toString() + ')')); }

    }





    this.clockStart = function() {
      startTime = new Date().getTime();
    }





    this.clockStop = function() {

      var stoppedAt = new Date().getTime();
      startTime = 0;
      return stoppedAt - startTime;

    }





    this.clockRead = function() {

      if (startTime == 0) { return 0; }
      return (new Date().getTime()) - startTime;

    }





    this.stepDown = function(Base, N, i, StateSet) {

      Base.runStep(i, StateSet[i]);
      UpdateCall(Generation, i, N+i+1, Base.getBestMatchSoFar(), Base.getCurrentDiff(), Base.clockRead().toString(), GetBestPolys(), GetBestVertices());

      if (N == 0) {
        Base.setRunning(false);
        return;
      } else {
        Call = Base.stepDown;
        setTimeout(function() { Call(Base, N-1, i+1, StateSet); }, 0);
      }

    }





    this.reset = function() {

      Generation = 0;
      setStatus('Idle');

      UpdateCall('-',-1,'-','-','-',0, GetBestPolys(), GetBestVertices());

    }





    this.MakeNewGeneration = function() {

      DeathPhase();

      return true;

    }





    var getGenesPerGen = function() {
      return parseInt(GenesPerGenField.value, 10);
    }





    var getNoisePerGen = function() {
      return parseInt(NoisePerGenField.value, 10);
    }





    var getMutationsPerGen = function() {
      return parseInt(MutatePerGenField.value, 10);
    }





    var getBonusMutationsPerGen = function() {
      return parseInt(BonusMutatePerGenField.value, 10);
    }





    var getAutumnSpawnPerGen = function() {
      return parseInt(AutumnSpawnPerGenField.value, 10);
    }





    var getSpringSpawnPerGen = function() {
      return parseInt(SpringSpawnPerGenField.value, 10);
    }





    this.run = function() {

      this.setRunning(true);
      this.clockStart();

      if (Generation == 0) {
        StateSet = this.genRandInitialStateSet(getGenesPerGen());
      } else {
        if (!(this.MakeNewGeneration())) { UnsetConstant(); return; }
      }

      LastGen = StateSet.slice(0);

      ++Generation;
      UpdateStatus("Running generation " + Generation.toString(), true);

      var iC = StateSet.length;

      BestMatchSoFar = 1.1;                             // worst possible is 1.0, so this is pInf
      BestMatchId    = undefined;

      this.drawPolysTo(StateSet[0].Polys, tgtContext);  // fill in the initial state

      if (document.getElementById('showRealtime').checked) { this.stepDown(this, iC-1, 0, StateSet); }
      else {

        var Base = this;

        setTimeout(function() {

          for (var i=0; i<iC; ++i) {
            Base.runStep(i, StateSet[i]);
            UpdateCall(Generation, i, iC, Base.getBestMatchSoFar(), Base.getCurrentDiff(), Base.clockRead().toString(), GetBestPolys(), GetBestVertices());
          }

          Base.setRunning(false);

        }, 1);

      }

    }





    this.getBestMatchSoFar = function() {
      return BestMatchSoFar;
    }





    this.getCurrentDiff = function() {
      return CurrentDiff;
    }





    this.checkIsRunning = function() {
      return isRunning;
    }





    this.dump = function() {

      document.getElementById('textdump').value = JSON.stringify(LastGen);

    }





    // finally, construct

    this.setTgts(
        UseUpdateCall,   UseUpdateBlock, UseUpdateStatus, UseUnsetConstant,
        OrigSourceImage, OrigSrcCanvas,  NovelCanvas,     WinnerCanvas,
        GenesPerGen,     NoisePerGen,    MutatePerGen,    BonusMutatePerGen, AutumnSpawnPerGen, SpringSpawnPerGen
    );





}