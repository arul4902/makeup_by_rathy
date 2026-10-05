import test from 'node:test';
import assert from 'node:assert/strict';
import {cameraAt,locateJourney} from '../components/artistry/journeyMath.ts';

test('camera never jumps when crossing a chapter boundary',()=>{
 for(let boundary=1;boundary<=11;boundary++){
  const left=cameraAt(boundary-.00001),right=cameraAt(boundary+.00001);
  assert.ok(Math.hypot(...left.map((v,i)=>v-right[i]))<.005,`discontinuous station ${boundary}`);
 }
});
test('scrolling backwards follows exactly the same camera path',()=>{
 const positions=Array.from({length:111},(_,i)=>cameraAt(i/10));
 for(let i=110;i>=0;i--)assert.deepEqual(cameraAt(i/10),positions[i]);
});
test('scene progress respects measured heights and clamps beyond the page',()=>{
 const scenes=[{start:0,height:2400},{start:2400,height:3200},{start:5600,height:2000}];
 assert.deepEqual(locateJourney(800,scenes,800),{chapter:0,progress:.5,travel:1/3});
 assert.deepEqual(locateJourney(2400,scenes,800),{chapter:1,progress:0,travel:1});
 assert.equal(locateJourney(9000,scenes,800).progress,1);
 assert.equal(locateJourney(-30,scenes,800).travel,0);
});
test('opening and finale pull backwards while mirror passage advances',()=>{
 assert.ok(cameraAt(.5)[2]>cameraAt(0)[2]);
 assert.ok(cameraAt(4)[2]<cameraAt(3)[2]);
 assert.ok(cameraAt(11)[2]>cameraAt(10)[2]);
});
