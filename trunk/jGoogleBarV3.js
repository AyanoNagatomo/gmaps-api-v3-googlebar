/**************************************************
*
* jGoogleBarV3.js
* A Google (Search) Bar for GMaps API V3 applications
* 
* Copyright (c) 2010, Jeremy R. Geerdes
* You are free to copy and use this sample under the terms of the Apache License, Version 2.0.
* For a copy of the license, view http://www.apache.org/licenses/LICENSE-2.0
*
* This script is offered AS-IS, with absolutely no warranty of any kind.
* 
**************************************************/



(function(){
 var m=google.maps, // fewer keystrokes is good
  s=google.search,
  defaultOptions={ // default options for the control; should be pretty self-explanatory
   resultSetSize : 8,
   clearResultsString : 'Clear results',
   icons : [],
   shadow : new m.MarkerImage('http://www.google.com/mapfiles/gadget/shadow50Small80.png',null,null,new m.Point(8,28)),
   showResultsList : true,
   showResultsMarkers : true
  };
 
 for(var i=0;i<8;i++){ // initialize our default markers
  defaultOptions.icons.push(google.loader.ServiceBase + "/solutions/localsearch/img/pin_metalred_" + String.fromCharCode(65+i) + ".png");
 }

 if(!window.noGBarCSS){ // load the CSS if we want it
  var style=createEl('link',null,null,{ // let's add the stylesheet we're going to need
           href : 'http://www.google.com/uds/solutions/localsearch/gmlocalsearch.css',
           rel : 'stylesheet',
           type : 'text/css'
          });
  document.getElementsByTagName('head')[0].appendChild(style);
 }
 
 // Google Bar itself
 function jGoogleBar(map,options){ // constructor
  var z=this,
   searcher=z.ls=new LocalSearch;
  z.gmap=map;
  z.options=mergeObjs(options,defaultOptions);
  z.infowindow=new m.InfoWindow;
  z.build();
  searcher.setCenterPoint(map);
  if(z.options.resultSetSize){
   searcher.setResultSetSize(z.options.resultSetSize)
  }
  searcher.setSearchCompleteCallback(z,jGoogleBar.prototype.searchCompleteCallback);
  if(typeof(z.options.buildCompleteCallback)=='function'){
   z.options.buildCompleteCallback.apply(z,[])
  }
 }
 jGoogleBar.prototype.build=function(){ // build the html elements of the control
  var z=this,
   container=z.container=createDiv('gmls',[
                                   z.innerContainer=createDiv('gmls-app gmls-idle gmls-app-full-mode gmls-std-mode',[
                                             z.resultsDiv=createDiv('gmls-results-popup',[
                                                                    createDiv('gmls-results-list',[
                                                                              createDiv('gmls-results-table',[
                                                                                        z.resultsTable=createEl('table','gmls-results-table')
                                                                                                    ]),
                                                                              createDiv('gmls-results-controls',[
                                                                                        createEl('table','gmls-results-controls',[
                                                                                                 createEl('tr',null,[
                                                                                                          createEl('td','gmls-more-results gsc-results',[createDiv('gsc-cursor-box',[z.pageDiv=createDiv('gsc-cursor')])]),
                                                                                                          createEl('td','gmls-prev-next'),
                                                                                                          createEl('td','gmls-clear-results',[createDiv('gmls-clear-results',[z.options.clearResultsString],{
                                                                                                                                                        onclick:function(){
                                                                                                                                                          jGoogleBar.prototype.clearResults.apply(z,[]);
                                                                                                                                                         }
                                                                                                                                                        })])
                                                                                                                     ])
                                                                                                 ])
                                                                                        ]),
                                                                              z.attributionDiv=createDiv('gmls-attribution')
                                                                                          ])
                                                                           ]),
                                             z.formDiv=createDiv('gmls-search-form gmls-search-form-idle')
                                             ])
                                           ]),
   form=z.form=new s.SearchForm(0,z.formDiv),
   input=z.input=form.input;
  input.onfocus=function(){
   z.formDiv.className=z.formDiv.className.replace(/\bgmls-search-form-idle\b/,'gmls-search-form-active');
  };
  form.setOnSubmitCallback(z,jGoogleBar.prototype.execute);
 };
 jGoogleBar.prototype.execute=function(query){ // execute a search
  var z=this,
   searcher=z.ls,
   input=z.input;
  z.clearResults();
  if(typeof(query)=='string'){
   input.value=query
  }
  searcher.execute(input.value);
 };
 jGoogleBar.prototype.clearResults=function(){ // clear the search results
  var z=this,
   table=z.resultsTable,
   innerContainer=z.innerContainer,
   searcher=z.ls,
   results=searcher.results,
   pageDiv=z.pageDiv,
   infowindow=z.infowindow;
  infowindow.close();
  innerContainer.className=innerContainer.className.replace(/\bgmls-active\b/,'gmls-idle');
 if(!results){
  return
 }
 rmChildren(table);
 rmChildren(pageDiv);
  for(var i=0;i<results.length;i++){
   var result=results[i];
   result.marker.setMap(null);
  }
 };
 jGoogleBar.prototype.searchCompleteCallback=function(){
  var z=this,
   searcher=z.ls,
   results=searcher.results,
   cursor=searcher.cursor,
   pageCell=z.pageDiv,
   resultsTable=z.resultsTable,
   attrib=searcher.getAttribution(),
   infowindow=z.infowindow,
   map=z.gmap,
   options=z.options,
   indexes=['A','B','C','D','E','F','G','H'],
   viewport=searcher.resultViewport,
   bounds=new m.LatLngBounds(new m.LatLng(parseFloat(viewport.sw.lat),parseFloat(viewport.sw.lng)),
                             new m.LatLng(parseFloat(viewport.ne.lat),parseFloat(viewport.ne.lng))),
   innerContainer=z.innerContainer,
   resultClosure=function(result){
    return function(){
     jGoogleBar.prototype.selectResult.apply(z,[result]);
    }
   },
   pageClosure=function(page){
    return function(){
     z.gotoPage(page);
    }
   };
 if(!options.suppressCenterAndZoom){
  map.fitBounds(bounds);
 }
 for(var i=0;i<results.length;i++){
   var result=results[i],
    index=indexes[i],
    html=result.listHtml=createEl('tr',null,[createEl('td',null,[createDiv('gmls-result-list-item',[
                                                                     createDiv('gmls-result-list-item-key gmls-result-list-item-key-'+index+' gmls-result-list-item-key-local-'+index+' gmls-result-list-item-key-keymode',['&nbsp;']),
                                                                     createDiv('gs-title',[result.title]),
                                                                     createDiv('gs-street',['&nbsp;-&nbsp;'+result.streetAddress])
                                                                     ])])]),
    marker=result.marker=new m.Marker({
                               map : options.showResultsMarkers ? map : null,
                               position : new m.LatLng(parseFloat(result.lat), parseFloat(result.lng)),
                               title : result.title,
                               icon : typeof(options.icons)=='string' ? options.icons : options.icons[i],
                               shadow : options.shadow,
                               shape : options.markerShape
                              });
   var clickListener=resultClosure(result);
   m.event.addDomListener(html,'click',clickListener);
   m.event.addListener(marker,'click',clickListener);
   if(options.showResultsList){
    resultsTable.appendChild(html);
   }
  }
  innerContainer.className=innerContainer.className.replace(/\bgmls-idle\b/,'gmls-active');
  for(var i=0;i<cursor.pages.length;i++){
   var page=cursor.pages[i];
   pageCell.appendChild(createDiv('gsc-cursor-page'+(i==cursor.currentPageIndex?' gsc-cursor-current-page':''),[page.label],{
                                  onclick : pageClosure(i)
                                  }));
  }
 };
 jGoogleBar.prototype.setResultSetSize=function(size){
  this.ls.setResultSetSize(size);
 };
 jGoogleBar.prototype.selectResult=function(result){
  var z=this,
   searcher=z.ls,
   results=searcher.results,
   map=z.gmap,
   infowindow=z.infowindow,
   marker=result.marker;
  for(var i=0;i<searcher.results.length;i++){
   var res=results[i],
    listItem=res.listHtml.firstChild.firstChild;
   if(res===result){
    if(!listItem.className.match(/\bgmls-selected\b/)){
     listItem.className=listItem.className+=' gmls-selected';
    }
   }else{
    listItem.className=listItem.className.replace(/ gmls-selected/g,'');
   }
  }
  infowindow.close();
  infowindow.setContent(result.html);
  infowindow.open(map,marker);
 };
 jGoogleBar.prototype.gotoPage=function(page){
  var z=this,
   searcher=z.ls;
  z.clearResults();
  searcher.gotoPage(page);
 };

 
 // Custom Local Search wrapper that supports GMaps v3
 function LocalSearch(){
  var z=this;
  z.options={
   v:'1.0',
   callback:'window.jeremy.gLocalSearch.callback',
   context:LocalSearch.searchers.length
  };
  LocalSearch.searchers.push(z);
 }
 LocalSearch.prototype.setCenterPoint=function(a){
  var z=this,
   options=z.options,
   b='function';
  if(typeis(a.lat,b)&&typeis(a.lng,b)&&typeis(a.toUrlValue,b)){
   options.sll=a.toUrlValue(6)
  }else if(typeis(a.getCenter,b)&&typeis(a.getBounds,b)){
   options.sll=function(){
    return a.getCenter().toUrlValue(6);
   };
   options.gll=function(){
    return a.getBounds().toUrlValue(7).replace(/\./g,'');
   };
   options.sspn=function(){
    return a.getBounds().toSpan().toUrlValue(6);
   };
  }else if(typeis(a,'string')){
   options.sll=a;
  }
 };
 LocalSearch.prototype.setResultSetSize=function(a){
  this.options.rsz=a;
 };
 LocalSearch.prototype.execute=function(q,start){
  var z=this,
   options=z.options,
   argsStr=[];
  for(var i in options){
   argsStr.push([i,encodeURIComponent(typeis(options[i],'function')?options[i]():options[i])].join('='));
  }
  if(start){
   argsStr.push(['start',encodeURIComponent(start)].join('='));
  }
  argsStr.push(['q',encodeURIComponent(q?q:z.currentQuery)].join('='));
  if(q || (start && z.currentQuery)){
   z.currentQuery=q||z.currentQuery;
   var script=createScript(LocalSearch.baseUrl+argsStr.join('&'));
   document.getElementsByTagName('head')[0].appendChild(script);
  }
 };
 LocalSearch.prototype.setSearchCompleteCallback=function(context,method,args){
  this.searchCompleteCallback=createClosure(context,method,args)
 };
 LocalSearch.prototype.gotoPage=function(page){
  var z=this,
   options=z.options,
   rsz=options.rsz;
  if(typeis(rsz,'string')){
   rsz=rsz.match(/^large$/)?8:4
  }
  z.execute(z.currentQuery,rsz*page);
 };
 LocalSearch.prototype.RAWcallback=function(response){
  var z=this,
   results=z.results=response.results;
  z.cursor=response.cursor;
  z.resultViewport=response.viewport;
  z.attribution=response.attribution;
  for(var i=0;i<results.length;i++){
   z.createResultHtml(results[i]);
  }
  if(typeis(z.searchCompleteCallback,'function')){
   z.searchCompleteCallback()
  }
 };
 LocalSearch.prototype.getAttribution=function(){
  if(!this.attribution){
   return false;
  }
  return createDiv('gs-results-attribution',[this.attribution]);
 };
 LocalSearch.prototype.createResultHtml=function(result){
  result.html=createDiv('gs-result gs-localResult',[
                                                   createDiv('gs-title',[createEl('a','gs-title',[result.title])]),
                                                   createDiv('gs-snippet',[result.snippet]),
                                                   createDiv('gs-address',[
                                                                           createDiv('gs-street gs-addressLine',[result.streetAddress]),
                                                                           createDiv('gs-city gs-addressLine',[result.city+', '+result.region]),
                                                                           createDiv('gs-country',[result.country])
                                                                           ]),
                                                   createDiv('gs-phone',[(result.phoneNumbers && result.phoneNumbers[0]) ? result.phoneNumbers[0].number : null]),
                                                   createDiv('gs-directions')
                                                   ])
 };
 LocalSearch.searchers=[];
 LocalSearch.callback=function(context,response){
  LocalSearch.searchers[context].RAWcallback(response)
 };
 LocalSearch.baseUrl='http://ajax.googleapis.com/ajax/services/search/local?';
 
 
 
 // utility functions
 function createEl(tag, className, children, attribs, styles){ // create an element with arbitrary tagName
  var el=document.createElement(tag||'div');
  if(className){
   el.className=className;
  }
  if(children){
   for(var i=0;i<children.length;i++){
    var child=children[i];
    if(typeof(child)=='string'||typeof(child)=='number'){
     el.innerHTML+=child;
    }else{
     try{
      el.appendChild(children[i])
     }catch(err){
      // well, we tried
     }
    }
   }
  }
  if(attribs){
   for(var i in attribs){
    if(i.match(/^on/) && typeis(attribs[i],'function')){
     el[i]=attribs[i]
    }else{
     el.setAttribute(i,attribs[i])
    }
   }
  }
  if(styles){
   for(var i in styles){
    el.style[i]=styles[i]
   }
  }
 return el
 }
 
 function createDiv(className, children, attribs, styles){ // wrapper for createEl to create divs.
  return createEl('div',className,children, attribs, styles)
 }
 
 function createScript(src){
  var el=createEl('script',null,null,{type:'text/javascript',src:src}),
   onload=function(){
    el.onload=null;
    el.parentNode.removeChild(el);
    delete(el)
   },
   onreadystatechange=function(){
    if(el.readyState=='ready'||el.readyState=='complete'){
    el.onreadystatechange=null;
    onload()
   }
  }
  return el
 }
 
 function createText(text){
  return document.createTextNode(text)
 }
 
 function createClosure(context,method,args){
  return function(){
   method.apply(context,args?args:[])
  }
 }
 
 function rmChildren(el){
  while(el.firstChild){
  el.removeChild(el.firstChild)
  }
 }
 
 function mergeObjs(){ // merge two or more objects, giving precedence to first one
  var c={},
   d=arguments;
  for(var i=0;i<d.length;i++){
   var e=d[i];
   for(var j in e){
    if(typeof(c[j])=='undefined'){
     c[j]=e[j]
    }
   }
  }
  return c
 }
 
 function typeis(v, test){ // tests to see if v's type is test
  return typeof(v) == test
 }
 
 
 
 // export stuff
 if(!window.jeremy){
  window.jeremy={};
 }
 window.jeremy.jGoogleBar=jGoogleBar;
 window.jeremy.gLocalSearch=LocalSearch;
})()