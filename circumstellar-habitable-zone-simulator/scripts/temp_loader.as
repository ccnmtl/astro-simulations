    public function doneLoadingData(... rest) : void
      {
         var starsListIdx:int = 0;
         var i:int = 0;
         var rawDataTableLen:int = 0;
         var dataTable:Array = null;
         var rawDataTable:ByteArray = null;
         var starHistoryData:Object = null;
         var maxLogLum:Number = NaN;
         var minLogLum:Number = NaN;
         var maxLogRadius:Number = NaN;
         var minLogRadius:Number = NaN;
         var maxMass:Number = NaN;
         var minMass:Number = NaN;
         var starListBA:ByteArray = loader.data;
         starListBA.position = 0;
         starListBA.uncompress();
         starsList = starListBA.readObject() as Array;
         var massValues:Array = [];
         starsListIdx = 0;
         while(starsListIdx < starsList.length)
         {
            dataTable = [];
            rawDataTableLen = (rawDataTable = starsList[starsListIdx].rawDataTable).length / 20;
            rawDataTable.position = 0;
            maxLogLum = Number.NEGATIVE_INFINITY;
            minLogLum = Number.POSITIVE_INFINITY;
            maxLogRadius = Number.NEGATIVE_INFINITY;
            minLogRadius = Number.POSITIVE_INFINITY;
            maxMass = Number.NEGATIVE_INFINITY;
            minMass = Number.POSITIVE_INFINITY;
            i = 0;
            while(i < rawDataTableLen)
            {
               (starHistoryData = {}).time = rawDataTable.readFloat();
               starHistoryData.mass = rawDataTable.readFloat();
               starHistoryData.logLum = rawDataTable.readFloat();
               starHistoryData.logRadius = rawDataTable.readFloat();
               starHistoryData.logTemp = rawDataTable.readFloat();
               starHistoryData.shzInner = 1;
               starHistoryData.shzOuter = 1;
               starHistoryData.shzTemp = 1;
               starHistoryData.distance = 1;
               dataTable[i] = starHistoryData;
               if(starHistoryData.mass > maxMass)
               {
                  maxMass = starHistoryData.mass;
               }
               if(starHistoryData.mass < minMass)
               {
                  minMass = starHistoryData.mass;
               }
               if(starHistoryData.logLum > maxLogLum)
               {
                  maxLogLum = starHistoryData.logLum;
               }
               if(starHistoryData.logLum < minLogLum)
               {
                  minLogLum = starHistoryData.logLum;
               }
               if(starHistoryData.logRadius > maxLogRadius)
               {
                  maxLogRadius = starHistoryData.logRadius;
               }
               if(starHistoryData.logRadius < minLogRadius)
               {
                  minLogRadius = starHistoryData.logRadius;
               }
               i++;
            }
            starsList[starsListIdx].dataTable = dataTable;
            starsList[starsListIdx].maxLogLum = maxLogLum;
            starsList[starsListIdx].minLogLum = minLogLum;
            starsList[starsListIdx].maxLogRadius = maxLogRadius;
            starsList[starsListIdx].minLogRadius = minLogRadius;
            starsList[starsListIdx].maxMass = maxMass;
            starsList[starsListIdx].minMass = minMass;
            massValues.push(starsList[starsListIdx].mass);
            starsListIdx++;
         }
         initStarMassSlider.setRangeType("finite set",massValues);
         startVeilFade();
         reset();
      }


      public function getData(time:Number) : Object
      {
         var starDataTableIdx:int = 0;
         var starDataTable:Array = selectedStar.dataTable;
         if(time < 0)
         {
            time = 0;
         }
         else if(time > selectedStar.timespan)
         {
            time = selectedStar.timespan;
         }
         starDataTableIdx = 1;
         while(starDataTableIdx < starDataTable.length)
         {
            if(time < starDataTable[starDataTableIdx].time)
            {
               break;
            }
            starDataTableIdx++;
         }
         if(starDataTableIdx >= starDataTable.length)
         {
            starDataTableIdx = starDataTable.length - 1;
         }
         var _loc4_:Object = starDataTable[starDataTableIdx - 1];
         var _loc5_:Object = starDataTable[starDataTableIdx];
         var _loc6_:Number;
         if((_loc6_ = (time - _loc4_.time) / (_loc5_.time - _loc4_.time)) < -0.0001 || _loc6_ > 1.0001)
         {
            trace("WARNING, invalid u, u: " + _loc6_);
         }
         var _loc7_:Object;
         (_loc7_ = {}).time = time;
         _loc7_.mass = _loc4_.mass + _loc6_ * (_loc5_.mass - _loc4_.mass);
         _loc7_.logRadius = _loc4_.logRadius + _loc6_ * (_loc5_.logRadius - _loc4_.logRadius);
         _loc7_.logTemp = _loc4_.logTemp + _loc6_ * (_loc5_.logTemp - _loc4_.logTemp);
         _loc7_.logLum = _loc4_.logLum + _loc6_ * (_loc5_.logLum - _loc4_.logLum);
         _loc7_.shzInner = _loc4_.shzInner + _loc6_ * (_loc5_.shzInner - _loc4_.shzInner);
         _loc7_.shzOuter = _loc4_.shzOuter + _loc6_ * (_loc5_.shzOuter - _loc4_.shzOuter);
         _loc7_.shzTemp = _loc4_.shzTemp + _loc6_ * (_loc5_.shzTemp - _loc4_.shzTemp);
         _loc7_.distance = _loc4_.distance + _loc6_ * (_loc5_.distance - _loc4_.distance);
         return _loc7_;
      }
