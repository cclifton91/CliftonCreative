// File#: _1_sliding-panels
// Usage: codyhouse.co/license
(function() {
  var SlidingPanels = function(element) {
    this.element = element;
    this.itemsList = this.element.getElementsByClassName('js-s-panels__projects-list');
    this.items = this.itemsList[0].getElementsByClassName('js-s-panels__project-preview');
    this.navigationToggle = this.element.getElementsByClassName('js-s-panels__nav-control');
    this.navigation = this.element.getElementsByClassName('js-s-panels__nav-wrapper');
    this.transitionLayer = this.element.getElementsByClassName('js-s-panels__overlay-layer');
    this.svgMask = this.element.getElementsByClassName('js-s-panels__mask');
    this.maskPoints = getMaskPoints(this);
    this.maskTransition = 500;
    this.selectedSection = false; // will be used to store the visible project content section
    this.animating = false;
    // components script ID - used to reload JS when new content is loaded
    this.componentsScriptId = 'components-script';
    // store initial page location
    this.homeLocation = window.location.href;
    // content progress bar
    this.progress = document.getElementsByClassName('js-progress-bar');
    this.contentLoaded = false;
    // aria labels for the navigationToggle button
    this.toggleAriaLabels = ['Toggle navigation', 'Close Content'];
    initSlidingPanels(this);
  };

  function initSlidingPanels(element) {
    // detect click on toggle menu
    if(element.navigationToggle.length > 0 && element.navigation.length > 0) {
      element.navigationToggle[0].addEventListener('click', function(event) {
        if(element.animating) return;
        
        // if project is open -> close project
        if(closeProjectIfVisible(element)) return;

        // if page is open -> close page
        if(closePageIfVisible(element)) return;
        
        // toggle navigation
        var openNav = Util.hasClass(element.navigation[0], 'is-hidden');
        toggleNavigation(element, openNav);
      });
    }

    // open project
    element.element.addEventListener('click', function(event) {
      var link = event.target.closest('.js-s-panels__project-control');
      if(!link) return;
      event.preventDefault();
      if(element.animating) return;
      openProject(element, event.target.closest('.js-s-panels__project-preview'), link.getAttribute('href'));
    });

    // open page content
    if(element.navigation.length > 0) {
      element.navigation[0].addEventListener('click', function(event) {
        var target = event.target.closest('.js-s-panels__nav-link');
        if(!target) return;
        event.preventDefault();
        if(element.animating) return;
        openPage(element, target);
      });
    }
  };

  // check if there's a visible project to close and close it
  function closeProjectIfVisible(element) {
    var visibleProject = element.element.getElementsByClassName('s-panels__project-preview--selected');
    if(visibleProject.length > 0) {
      element.animating = true;
      closeProject(element);
      return true;
    }

    return false;
  };

  function toggleNavigation(element, openNavigation) {
    element.animating = true;
    if(openNavigation) Util.removeClass(element.navigation[0], 'is-hidden');
    slideProjects(element, openNavigation, false, function(){
      element.animating = false;
      if(!openNavigation) Util.addClass(element.navigation[0], 'is-hidden');
    });
    Util.toggleClass(element.navigationToggle[0], 's-panels__nav-control--arrow-down', openNavigation);
  };

  function openProject(element, project, path) {
    element.animating = true;
    element.selectedSection = document.getElementById(path.replace('.html', ''));
    loadContent(element, path, 'project', element.selectedSection, function() {
      var projectIndex = Util.getIndexInArray(element.items, project);
      // hide navigation
      Util.removeClass(element.itemsList[0], 'bg-opacity-0');
      // expand selected projects
      Util.addClass(project, 's-panels__project-preview--selected');
      // hide remaining projects
      slideProjects(element, true, projectIndex, function() {
        // reveal section content
        if(element.selectedSection) Util.removeClass(element.selectedSection, 'is-hidden');
        element.animating = false;
        // trigger a custom event - this can be used to init the project content (if required)
        element.element.dispatchEvent(new CustomEvent('slidingPanelOpen', {detail: projectIndex}));
      });
      // modify toggle button appearance
      Util.addClass(element.navigationToggle[0], 's-panels__nav-control--close');
      // modify toggle button aria-label
      element.navigationToggle[0].setAttribute('aria-label', element.toggleAriaLabels[1]);
    });
  };

  function closeProject(element) {
    // remove transitions from projects
    toggleTransitionProjects(element, true);
    // hide navigation
    Util.removeClass(element.itemsList[0], 'bg-opacity-0');
    // reveal transition layer
    Util.addClass(element.transitionLayer[0], 's-panels__overlay-layer--visible');
    // wait for end of transition layer effect
    element.transitionLayer[0].addEventListener('transitionend', function cb(event) {
      if(event.propertyName != 'opacity') return;
      element.transitionLayer[0].removeEventListener('transitionend', cb);
      // update projects classes
      resetProjects(element);

      setTimeout(function(){
        // hide transition layer
        Util.removeClass(element.transitionLayer[0], 's-panels__overlay-layer--visible');
        // reveal projects
        slideProjects(element, false, false, function() {
          Util.addClass(element.itemsList[0], 'bg-opacity-0');
          element.animating = false;
        });
        // update browser history
        updateBrowserLocation(element.homeLocation);
      }, 200);
    });

    // modify toggle button appearance
    Util.removeClass(element.navigationToggle[0], 's-panels__nav-control--close');
    // modify toggle button aria-label
    element.navigationToggle[0].setAttribute('aria-label', element.toggleAriaLabels[0]);
  };

  function slideProjects(element, openNav, exclude, cb) {
    // projects will slide out in a random order
    var randomList = getRandomList(element.items.length, exclude);
    for(var i = 0; i < randomList.length; i++) {(function(i){
      setTimeout(function(){
        Util.toggleClass(element.items[randomList[i]], 's-panels__project-preview--hide', openNav);
        toggleProjectAccessibility(element.items[randomList[i]], openNav);
        if(cb && i == randomList.length - 1) {
          // last item to be animated -> execute callback function at the end of the animation
          element.items[randomList[i]].addEventListener('transitionend', function cbt() {
            if(event.propertyName != 'transform') return;
            if(cb) cb();
            element.items[randomList[i]].removeEventListener('transitionend', cbt);
          });
        }
      }, i*100);
    })(i);}
  };

  function toggleTransitionProjects(element, bool) {
    // remove transitions from project elements
    for(var i = 0; i < element.items.length; i++) {
      Util.toggleClass(element.items[i], 's-panels__project-preview--no-transition', bool);
    }
  };

  function resetProjects(element) {
    // reset projects classes -> remove selected/no-transition class + add hide class
    for(var i = 0; i < element.items.length; i++) {
      Util.removeClass(element.items[i], 's-panels__project-preview--selected s-panels__project-preview--no-transition');
      Util.addClass(element.items[i], 's-panels__project-preview--hide');
    }

    // hide project content
    if(element.selectedSection) Util.addClass(element.selectedSection, 'is-hidden');
    element.selectedSection = false;
  };

  function getRandomList(maxVal, exclude) {
    // get list of random integer from 0 to (maxVal - 1) excluding (exclude) if defined
    var uniqueRandoms = [];
    var randomArray = [];
    
    function makeUniqueRandom() {
      // refill the array if needed
      if (!uniqueRandoms.length) {
        for (var i = 0; i < maxVal; i++) {
          if(exclude === false || i != exclude) uniqueRandoms.push(i);
        }
      }
      var index = Math.floor(Math.random() * uniqueRandoms.length);
      var val = uniqueRandoms[index];
      // now remove that value from the array
      uniqueRandoms.splice(index, 1);
      return val;
    }

    for(var j = 0; j < maxVal; j++) {
      randomArray.push(makeUniqueRandom());
    }

    return randomArray;
  };

  function toggleProjectAccessibility(project, bool) {
    bool ? project.setAttribute('aria-hidden', 'true') : project.removeAttribute('aria-hidden');
    var link = project.getElementsByClassName('js-s-panels__project-control');
    if(link.length > 0) {
      bool ? link[0].setAttribute('tabindex', '-1') : link[0].removeAttribute('tabindex');
    }
  };

  // check if there's an open page -> close it
  function closePageIfVisible(element) {
    var visiblePage = element.element.getElementsByClassName('s-panels__page--selected');
    if(visiblePage.length > 0) {
      element.animating = true;
      closePage(element, visiblePage[0]);
      return true;
    }

    return false;
  };

  // open a new page
  function openPage(element, target) {
    element.animating = true;
    var path = target.getAttribute('href');
    var pageContent = document.getElementById(path.replace('.html', ''));
    loadContent(element, path, 'page', pageContent, function() {
      // modify trigger appearance
      toggleTriggerForPage(element, true);
      // modify toggle button aria-label
      element.navigationToggle[0].setAttribute('aria-label', element.toggleAriaLabels[1]);

      Util.removeClass(pageContent, 'is-hidden');
      animateSvgMask(element, function(){
        Util.addClass(pageContent, 's-panels__page--selected');
        pageContent.addEventListener('transitionend', function cb(event){
          if(event.propertyName == 'opacity') {
            Util.addClass(element.svgMask[0], 'is-hidden');
            element.svgPath.setAttribute('d', element.maskPoints[0]);
            pageContent.removeEventListener('transitionend', cb);
            // hide menu
            Util.addClass(element.navigation[0], 'is-hidden');
            element.animating = false;
          }
        });
      });
    });
  };

  function closePage(element, visiblePage) {
    // change trigger appearance
    toggleTriggerForPage(element, false);
    // modify toggle button aria-label
    element.navigationToggle[0].setAttribute('aria-label', element.toggleAriaLabels[0]);
    // reveal transition layer
    Util.addClass(element.transitionLayer[0], 's-panels__overlay-layer--visible');
    // reveal main navigation
    Util.removeClass(element.navigation[0], 'is-hidden');
    // wait for end of transition layer effect
    element.transitionLayer[0].addEventListener('transitionend', function cb(event) {
      if(event.propertyName != 'opacity') return;
      element.transitionLayer[0].removeEventListener('transitionend', cb);
      // hide page
      Util.removeClass(visiblePage, 's-panels__page--selected');
      Util.addClass(visiblePage, 'is-hidden');
      // fade out transition layer
      Util.removeClass(element.transitionLayer[0], 's-panels__overlay-layer--visible');
      element.animating = false;
      // update browser history
      updateBrowserLocation(element.homeLocation);
    });
  };

  function animateSvgMask(element, cb) {
    if(element.svgMask.length < 1 || reducedMotion || !animeJSsupported) {
      cb();
      return;
    }
    // reveal and animate svg mask
    Util.removeClass(element.svgMask[0], 'is-hidden');
    morphSinglePath(element.svgPath, element.maskPoints, element.maskTransition, cb);
  };

  function toggleTriggerForPage(element, bool) {
    // bool == true -> page is visible
    Util.toggleClass(element.navigationToggle[0], 's-panels__nav-control--close', bool);
    Util.toggleClass(element.navigationToggle[0], 's-panels__nav-control--arrow-down', !bool);
  };

  function getMaskPoints(element) {
    if(element.svgMask.length < 1) return false;
    var array = [];
    element.svgPath = element.svgMask[0].getElementsByTagName('path')[0];
    for(var j = 1; j < 4; j++) {
      array.push(element.svgMask[0].getAttribute('data-path-'+j));
    }
    return array;
  };

  function morphSinglePath(path, points, duration, cb) {
    var dAnimation = [{ value: [points[0], points[1]]}, { value: [points[1], points[2]]}];
    anime({
      targets: path,
      d: dAnimation,
      easing: 'easeOutQuad',
      duration: duration,
      complete: function() {
        if(cb) cb();
      }
    });
  };

  function loadContent(element, path, type, wrapper, cb) {
    wrapper.innerHTML = '';

    // remove components script
    var srcValue = removeScript(element);

    // start loading bar animation
    element.contentLoaded = false;
    startProgressAnimation(element, 10);

    // get the project/page content
    loadPage(path, function(content) {
      element.contentLoaded = true;
      // load the new content
      wrapper.innerHTML = filterPageContent(content, path);
      // re-init javascript
      loadScript(srcValue, element.componentsScriptId);
      // complete loading bar animation
      completeProgressAnimation(element, function() {
        // update browser location
        updateBrowserLocation(path);
        cb();
      });
    });
  };

  function loadPage(path, cb) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) cb(this.responseText);
    };
    xhttp.open("GET", path, true);
    xhttp.send();
  };

  function removeScript(element) {
    var componentsScript = document.getElementById(element.componentsScriptId);
    var srcValue = componentsScript.getAttribute('src');
    componentsScript.remove();
    return srcValue;
  };

  function loadScript(srcValue, id) {
    var script = document.createElement('script');
    script.setAttribute('src', srcValue);
    script.setAttribute('id', id);
    document.body.appendChild(script);
  };

  function filterPageContent(content, path) {
    // from the loaded page, get only the content that needs to be added to the index.html
    var dom = document.createElement('div');
    var id = path.replace('.html', '');
    dom.innerHTML = content;
    return dom.querySelector('#'+id).innerHTML;
  };

  function updateBrowserLocation(path) {
    history.replaceState(null, '', path);
  };

  function startProgressAnimation(element, progress) {
    if(element.progress.length < 0 || element.contentLoaded || progress >= 100) return;
    Util.removeClass(element.progress[0], 'is-hidden');
    element.progress[0].style.transform = 'scaleX('+progress/100+')';
    element.progress[0].addEventListener('transitionend', function cb() {
      element.progress[0].removeEventListener('transitionend', cb);
      startProgressAnimation(element, progress+10);
    });
  };

  function completeProgressAnimation(element, cb) {
    if(element.progress.length < 0) {
      cb();
      return;
    }
    
    var cbTransition = function() {
      if(element.progress[0].style.transform != 'scaleX(1)') return;
      element.progress[0].removeEventListener('transitionend', cbTransition);
      if(element.timeoutId) clearTimeout(element.timeoutId);
      element.timeoutId = false;
      Util.addClass(element.progress[0], 'is-hidden');
      cb();
    };

    element.progress[0].style.transform = 'scaleX(1)';
    element.progress[0].addEventListener('transitionend', cbTransition);
    // set a fallback timeout in case the transitionend event fails
    element.timeoutId = setTimeout(function(){
      element.progress[0].removeEventListener('transitionend', cbTransition);
      Util.addClass(element.progress[0], 'is-hidden');
      cb();
    }, 1200);
  };

  //initialize the SlidingPanels objects
  var slidingPanels = document.getElementsByClassName('js-s-panels'),
    reducedMotion = Util.osHasReducedMotion(),
    animeJSsupported = window.Map; // test if the library used for the animation works
	if( slidingPanels.length > 0 ) {
		for( var i = 0; i < slidingPanels.length; i++) {
			(function(i){new SlidingPanels(slidingPanels[i]);})(i);
		}
	}
}());