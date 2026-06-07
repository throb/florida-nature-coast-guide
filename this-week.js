(function(){
      var bar = document.getElementById('bar');
      var progress = document.getElementById('progress');
      var sections = Array.prototype.slice.call(document.querySelectorAll('main section:not([hidden])'));
      var rail = document.getElementById('rail');
      var sectionPicker = document.getElementById('section-picker');

      sections.forEach(function(s){
        var label = s.getAttribute('data-screen-label') || s.id;
        var a = document.createElement('a');
        a.href = '#' + s.id; a.setAttribute('data-target', s.id);
        a.setAttribute('aria-label', label);
        a.setAttribute('title', label);
        a.innerHTML = '<span>' + label + '</span>';
        if (rail) rail.appendChild(a);
        if(sectionPicker){
          var option = document.createElement('option');
          option.value = s.id;
          option.textContent = label;
          sectionPicker.appendChild(option);
        }
      });
      var railLinks = rail ? Array.prototype.slice.call(rail.children) : [];
      var weekNavLinks = Array.prototype.slice.call(document.querySelectorAll('.week-nav a[data-target]'));
      if(sectionPicker){
        sectionPicker.addEventListener('change', function(){
          var target = document.getElementById(sectionPicker.value);
          if(target) target.scrollIntoView({ block:'start', behavior:'smooth' });
        });
      }

      var dailyHeroImages = [
        {
          src: 'https://commons.wikimedia.org/wiki/Special:FilePath/Three_sisters_springs_near_crystal_river_national_wildlife_refuge.jpg?width=1800',
          label: 'Three Sisters Springs, Crystal River',
          credit: 'via Wikimedia Commons'
        },
        {
          src: 'https://commons.wikimedia.org/wiki/Special:FilePath/Crystal_River_near_Hunter_Spring_Run_-_panoramio.jpg?width=1800',
          label: 'Crystal River near Hunter Spring Run',
          credit: 'via Wikimedia Commons'
        },
        {
          src: 'https://commons.wikimedia.org/wiki/Special:FilePath/Rainbow_spgs_florida.JPG?width=1800',
          label: 'Rainbow Springs State Park',
          credit: 'via Wikimedia Commons'
        },
        {
          src: 'https://commons.wikimedia.org/wiki/Special:FilePath/Silver_Springs_State_Park_-_Headspring_Entrance_Sign.jpg?width=1800',
          label: 'Silver Springs State Park',
          credit: 'via Wikimedia Commons'
        },
        {
          src: 'https://commons.wikimedia.org/wiki/Special:FilePath/Paynes_Prairie_observation_tower_view.jpg?width=1800',
          label: 'Paynes Prairie observation tower view',
          credit: 'via Wikimedia Commons'
        },
        {
          src: 'https://commons.wikimedia.org/wiki/Special:FilePath/Cedar_Key_Aerial.jpg?width=1800',
          label: 'Cedar Key aerial shoreline',
          credit: 'via Wikimedia Commons'
        },
        {
          src: 'https://commons.wikimedia.org/wiki/Special:FilePath/Withlacoochee_State_Trail_looking_north_at_point_where_it_makes_a_tee_intersection_with_the_Good_Neighbor_Trail_Aug_8_2020_at_location_28%C2%B035%2722.2%22N_82%C2%B013%2742.3%22W.jpg?width=1800',
          label: 'Withlacoochee State Trail',
          credit: 'via Wikimedia Commons'
        },
        {
          src: 'https://commons.wikimedia.org/wiki/Special:FilePath/Crystal_River_Preserve_State_Park.jpg?width=1800',
          label: 'Crystal River Preserve State Park',
          credit: 'via Wikimedia Commons'
        },
        {
          src: 'https://commons.wikimedia.org/wiki/Special:FilePath/Crystal_River_Preserve_State_Park_2.jpg?width=1800',
          label: 'Crystal River Preserve marshland',
          credit: 'via Wikimedia Commons'
        },
        {
          src: 'https://commons.wikimedia.org/wiki/Special:FilePath/Dolphin_at_Fort_Island_Gulf_Beach.jpg?width=1800',
          label: 'Fort Island Gulf Beach',
          credit: 'via Wikimedia Commons'
        },
        {
          src: 'https://commons.wikimedia.org/wiki/Special:FilePath/Crystal_River_in_Crystal_River05.jpg?width=1800',
          label: 'Crystal River waterway',
          credit: 'via Wikimedia Commons'
        },
        {
          src: 'https://commons.wikimedia.org/wiki/Special:FilePath/Crystal_Street_in_Crystal_River,_Florida.jpg?width=1800',
          label: 'Crystal River streetscape',
          credit: 'via Wikimedia Commons'
        },
        {
          src: 'https://commons.wikimedia.org/wiki/Special:FilePath/The_fish_market_in_Homosassa,_Florida.jpg?width=1800',
          label: 'Homosassa fish market',
          credit: 'via Wikimedia Commons'
        }
      ];

      function dayOfYear(date){
        var start = new Date(date.getFullYear(), 0, 0);
        return Math.floor((date - start) / 86400000);
      }
      function pickDailyHero(date){
        return dailyHeroImages[dayOfYear(date) % dailyHeroImages.length];
      }
      function applyHeroImage(hero){
        if(!hero) return;
        var img = document.querySelector('.mast .hero-ph img[data-photo]');
        var tag = document.querySelector('.mast .hero-ph .tag');
        var cap = document.querySelector('.mast .hero-cap');
        var label = hero.label || hero.imageLabel || hero.imageAlt || hero.alt || 'Florida Nature Coast';
        var credit = hero.credit || hero.imageCredit || 'daily OpenClaw update';
        var src = hero.src || hero.image || hero.url;
        if(!src) return;
        if(img){
          img.alt = label;
          img.src = src;
        }
        if(tag) tag.textContent = 'PHOTO - ' + label;
        if(cap) cap.textContent = label + ' - ' + credit;
      }
      function heroFromHomepageSetting(homepage){
        if(!homepage) return null;
        var hero = homepage.hero || homepage.masthead || homepage;
        if(!hero || !(hero.image || hero.src || hero.url)) return null;
        return hero;
      }
      function initDailyHero(){
        applyHeroImage(pickDailyHero(new Date()));
      }
      initDailyHero();

      var dayTrips = [
        {
          issue: 'Issue 001',
          date: 'June 4, 2026',
          status: 'This week',
          title: 'Kings Bay Clear-Water Loop',
          dek: 'A bright, easy Crystal River day: clear kayak or snorkel early, local lunch, Hunter Springs float, and a Fort Island sunset.',
          image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Crystal_River_near_Hunter_Spring_Run_-_panoramio.jpg?width=1100',
          imageLabel: 'Crystal River near Hunter Spring Run',
          tags: ['Water', 'Easy', 'First trip'],
          stops: [
            ['Morning', 'Get in the water', 'Paddle or snorkel Kings Bay while the water is bright.'],
            ['Midday', 'Local lunch', 'Biscuit Barn or Sadie\'s keeps the loop easy.'],
            ['Afternoon', 'Slow float', 'Hunter Springs for a swim and extra clear-water time.'],
            ['Sunset', 'Gulf close', 'Fort Island Gulf Beach for the closing view.']
          ],
          links: [
            ['Crystal River Refuge', 'https://www.fws.gov/apps/refuge/crystal-river/visit-us'],
            ['Hunter Springs', 'https://www.discovercrystalriverfl.com/directory/hunter-springs-park-boardwalks/'],
            ['Fort Island Beach', 'https://www.discovercrystalriverfl.com/directory/fort-island-gulf-beach/']
          ]
        },
        {
          issue: 'Archive 002',
          date: 'Classic',
          status: 'Day trip',
          title: 'Silver Springs Boat and Paddle Day',
          dek: 'Glass-bottom boats for the timeless view, then a slow paddle if you want the river to stretch out a little longer.',
          image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Silver_Springs_State_Park_-_Headspring_Entrance_Sign.jpg?width=1100',
          imageLabel: 'Silver Springs State Park',
          tags: ['Springs', 'Family', 'Ocala'],
          stops: [
            ['Morning', 'Boat first', 'Book a glass-bottom boat and get the classic spring view.'],
            ['Late AM', 'Walk the headspring', 'Look for fish, turtles, birds, and glassy water.'],
            ['Lunch', 'Ocala pause', 'Keep it easy near the park or downtown Ocala.'],
            ['Afternoon', 'Add a paddle', 'Rent a kayak if the river is calling.']
          ],
          links: [
            ['Glass-bottom boats', 'https://silversprings.com/plan-your-day/glass-bottom-boats/'],
            ['Plan the park day', 'https://silversprings.com/plan-your-day/'],
            ['Kayak rentals', 'https://kayakingsilversprings.com/silver-springs-kayak-rentals']
          ]
        },
        {
          issue: 'Archive 003',
          date: 'Sunset',
          status: 'Food loop',
          title: 'Ozello Seafood Sunset Run',
          dek: 'Cruise the marsh road at golden hour, stop for Ozello seafood, and make the whole evening feel like a small discovery.',
          image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Crystal_River_Preserve_State_Park_2.jpg?width=1100',
          imageLabel: 'Crystal River Preserve marshland',
          tags: ['Seafood', 'Sunset', 'Drive'],
          stops: [
            ['Late day', 'Take the trail', 'Drive Ozello Trail as the marsh opens up.'],
            ['Dinner', 'Seafood stop', 'Choose Peck\'s or Backwater Fins for the meal.'],
            ['Golden hour', 'Walk Ozello Park', 'Watch the light shift across the marsh.'],
            ['After', 'Roll back easy', 'Head toward Crystal River with the windows down.']
          ],
          links: [
            ['Ozello Park', 'https://www.discovercrystalriverfl.com/directory/ozello-park/'],
            ['Peck\'s Old Port Cove', 'https://pecksoldportcove.com/'],
            ['Backwater Fins', 'https://backwater-fins.com/']
          ]
        },
        {
          issue: 'Archive 004',
          date: 'Easy',
          status: 'Beach',
          title: 'Fort Island Gulf Beach Reset',
          dek: 'A low-friction sunset plan with Gulf air, picnic potential, and a quick route back into Crystal River for dinner.',
          image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Dolphin_at_Fort_Island_Gulf_Beach.jpg?width=1100',
          imageLabel: 'Fort Island Gulf Beach',
          tags: ['Beach', 'Sunset', 'Easy'],
          stops: [
            ['Afternoon', 'Head west', 'Pack light and take Fort Island Trail toward the Gulf.'],
            ['Beach', 'Settle in', 'Swim, walk the shore, or sit with the Gulf breeze.'],
            ['Sunset', 'Stay for color', 'Let the light stretch out over the flats.'],
            ['Dinner', 'Close in town', 'Return to Crystal River for an easy dinner.']
          ],
          links: [
            ['Fort Island Beach', 'https://www.discovercrystalriverfl.com/directory/fort-island-gulf-beach/'],
            ['Crystal River events', 'https://www.discovercrystalriverfl.com/events/']
          ]
        }
      ];

      var eats = [
        {
          lane: 'Today\'s radar',
          title: 'Backwater Fins',
          dek: 'Ozello seafood, Cajun-leaning plates, and brunch hours that make it a strong day-trip lunch anchor.',
          place: 'Ozello Trail · seafood',
          badges: ['Waterfront', 'Brunch', 'Seafood'],
          href: 'https://backwater-fins.com/',
          websiteUrl: 'https://backwater-fins.com/',
          mapQuery: 'Backwater Fins Ozello FL',
          placePhotoQuery: 'Backwater Fins Ozello FL',
          image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Crystal_River_Preserve_State_Park.jpg?width=1000',
          imageLabel: 'Backwater Fins',
          featured: true
        },
        {
          lane: 'Waterfront classic',
          title: 'Peck\'s Old Port Cove',
          dek: 'A long-running Ozello stop for seafood, old-Florida atmosphere, and a route-friendly dinner after the marsh drive.',
          place: 'Ozello · seafood',
          badges: ['Classic', 'Dinner', 'Drive-worthy'],
          href: 'https://pecksoldportcove.com/',
          websiteUrl: 'https://pecksoldportcove.com/',
          mapQuery: 'Peck\'s Old Port Cove Crystal River FL',
          placePhotoQuery: 'Peck\'s Old Port Cove Crystal River FL',
          image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Crystal_River_Preserve_State_Park_2.jpg?width=1000',
          imageLabel: 'Peck\'s Old Port Cove',
          featured: true
        },
        {
          lane: 'Unique local pick',
          title: 'The Freezer Tiki Bar',
          dek: 'Casual Homosassa energy, shrimp, cold drinks, and the kind of local texture visitors remember.',
          place: 'Homosassa · tiki bar',
          badges: ['Unique', 'Casual', 'Shrimp'],
          href: 'https://the-freezer-homosassa.com/',
          websiteUrl: 'https://the-freezer-homosassa.com/',
          mapQuery: 'The Freezer Tiki Bar Homosassa FL',
          placePhotoQuery: 'The Freezer Tiki Bar Homosassa FL',
          image: 'https://commons.wikimedia.org/wiki/Special:FilePath/The_fish_market_in_Homosassa,_Florida.jpg?width=1000',
          imageLabel: 'The Freezer Tiki Bar',
          featured: true
        },
        {
          lane: 'Breakfast loop',
          title: 'The Biscuit Barn',
          dek: 'A useful breakfast anchor before springs, paddles, errands, or a Crystal River loop.',
          place: 'Crystal River · breakfast',
          badges: ['Breakfast', 'Local', 'Quick stop'],
          href: 'https://www.biscuitbarn.net/',
          websiteUrl: 'https://www.biscuitbarn.net/',
          mapQuery: 'The Biscuit Barn Crystal River FL',
          placePhotoQuery: 'The Biscuit Barn Crystal River FL',
          image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Crystal_Street_in_Crystal_River,_Florida.jpg?width=1000',
          imageLabel: 'The Biscuit Barn'
        },
        {
          lane: 'Local lunch',
          title: 'Sadie\'s Corner Kitchen',
          dek: 'A small local kitchen that fits the easy lunch slot in the Kings Bay day-trip loop.',
          place: 'Crystal River · lunch',
          badges: ['Local', 'Lunch', 'Loop stop'],
          href: 'https://m.facebook.com/SadiesCornerKitchen/',
          websiteUrl: 'https://m.facebook.com/SadiesCornerKitchen/',
          mapQuery: 'Sadie\'s Corner Kitchen Crystal River FL',
          placePhotoQuery: 'Sadie\'s Corner Kitchen Crystal River FL',
          image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Crystal_River_in_Crystal_River05.jpg?width=1000',
          imageLabel: 'Sadie\'s Corner Kitchen'
        }
      ];

      function esc(str){
        return String(str == null ? '' : str).replace(/[&<>"']/g, function(ch){
          return ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[ch];
        });
      }
      function chips(items){
        return (items || []).map(function(item){ return '<span class="chip">' + esc(item) + '</span>'; }).join('');
      }
      function mapUrl(item){
        return item.mapUrl || 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(item.mapQuery || (item.title + ' ' + (item.place || 'Nature Coast Florida')));
      }
      function websiteUrl(item){
        return item.websiteUrl || item.href || '#';
      }
      function placePhotoImageUrl(item){
        var placeId = item.googlePlaceId || item.placeId;
        if(!placeId && !item.placePhotoQuery) return '';
        return '/api/place-photo?' + (placeId ? 'placeId=' + encodeURIComponent(placeId) : 'query=' + encodeURIComponent(item.placePhotoQuery));
      }
      function placePhotoMetaUrl(item){
        var placeId = item.googlePlaceId || item.placeId;
        if(!placeId && !item.placePhotoQuery) return '';
        return '/api/place-photo?format=json&' + (placeId ? 'placeId=' + encodeURIComponent(placeId) : 'query=' + encodeURIComponent(item.placePhotoQuery));
      }
      function imageSrc(item){
        return placePhotoImageUrl(item) || item.image || '';
      }
      function placePhotoAttrs(item){
        var attrs = ' onerror="this.onerror=null;this.classList.add(\'photo-failed\');if(this.parentNode)this.parentNode.classList.add(\'photo-missing\');"';
        var metaUrl = placePhotoMetaUrl(item);
        if(metaUrl) attrs += ' data-place-photo-meta="' + esc(metaUrl) + '"';
        return attrs;
      }
      function placeActions(item, className){
        return '<div class="' + className + '">' +
          '<a href="' + esc(mapUrl(item)) + '" target="_blank" rel="noopener">MAP</a>' +
          '<a href="' + esc(websiteUrl(item)) + '" target="_blank" rel="noopener">WEBSITE</a>' +
        '</div>';
      }
      function dateBadge(value){
        if(!value) return { day: '', month: 'TBD' };
        var normalized = /^\d{4}-\d{2}-\d{2}$/.test(String(value)) ? String(value) + 'T12:00:00' : value;
        var date = new Date(normalized);
        if(Number.isNaN(date.getTime())) return { day: '', month: 'TBD' };
        return {
          day: String(date.getDate()),
          month: date.toLocaleDateString('en-US', { weekday: 'short' })
        };
      }
      function candidateLane(candidate){
        return candidate && candidate.raw && candidate.raw.lane ? String(candidate.raw.lane) : '';
      }
      function isGenericCandidateUrl(value){
        if(!value) return true;
        var url;
        try { url = new URL(value, window.location.href); } catch(e){ return true; }
        var host = url.hostname.replace(/^www\./, '');
        var path = url.pathname.replace(/\/+$/, '').toLowerCase();
        var hasEventId = url.searchParams.has('EID') || url.searchParams.has('EventID') || url.searchParams.has('eventId') || url.searchParams.has('id');
        if(host === 'discovercrystalriverfl.com' && path === '/events') return true;
        if(host === 'business.citruscountychamber.com' && path === '/eventcalendar/search') return true;
        if((host === 'inverness.gov' || host === 'inverness-fl.gov') && (path === '/calendar' || path === '/calendar.aspx') && !hasEventId) return true;
        if(host === 'ocalamarion.com' && path === '/events/community-calendar') return true;
        return path === '/events' || path === '/calendar';
      }
      function hasUsefulCandidateLink(candidate){
        return candidate && candidate.url && !isGenericCandidateUrl(candidate.url);
      }
      function isCommunityEventCandidate(candidate){
        if(!candidate || !candidate.startsAt) return false;
        var lane = candidateLane(candidate);
        if(/alert|rule|regulation|condition|closure|access|shortage|weather|state-park/.test(lane)) return false;
        if(candidate.raw && candidate.raw.kind && candidate.raw.kind !== 'event') return false;
        return true;
      }
      function cleanPublicGuideCopy(){
        document.querySelectorAll('.pin').forEach(function(pin){
          if(/source/i.test(pin.textContent || '')) pin.textContent = 'Details';
        });
        var footerSources = document.querySelector('footer .src');
        if(footerSources){
          footerSources.innerHTML =
            'The sharp weekly guide to Crystal River, Homosassa, Ocala, Gainesville, and the wild water in between.<br>' +
            'Built for people who want the good stuff fast.';
        }
      }
      function renderDailyUpdate(data){
        var snapshot = data.weatherSnapshot;
        var candidates = (data.sourceCandidates || []).filter(function(candidate){
          return candidate && candidate.status !== 'archived' && hasUsefulCandidateLink(candidate);
        }).slice(0, 6);
        var eventCandidates = candidates.filter(isCommunityEventCandidate);
        function uvLabel(snapshot){
          var uv = snapshot && snapshot.uvIndex;
          if(uv == null) return '';
          if(typeof uv === 'number') return String(uv);
          if(typeof uv === 'string') return uv;
          var value = uv.value != null ? String(uv.value) : '';
          var category = uv.category || uv.risk || uv.level || '';
          if(category && value) return category + ' (' + value + ')';
          return category || value;
        }
        function weatherSummary(snapshot){
          if(!snapshot) return '';
          var summary = snapshot.summary || '';
          var uv = uvLabel(snapshot);
          if(uv && !/uv/i.test(summary)){
            summary += (summary ? ' ' : '') + 'UV index is ' + uv + (snapshot.uvIndex && snapshot.uvIndex.window ? ' during ' + snapshot.uvIndex.window : '') + '.';
          }
          return summary;
        }

        var heroBox = document.querySelector('.hero-box');
        if(heroBox && (snapshot || candidates.length)){
          var panel = document.getElementById('daily-update-panel');
          if(!panel){
            panel = document.createElement('div');
            panel.id = 'daily-update-panel';
            panel.className = 'daily-update-panel';
            heroBox.appendChild(panel);
          }
          panel.innerHTML =
            '<div class="dup-head"><span class="blip"></span><span>Daily update loaded</span><b>' + esc(new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })) + '</b></div>' +
            (snapshot ? '<p><strong>' + esc(snapshot.label || 'Weather') + ':</strong> ' + esc(weatherSummary(snapshot)) + '</p>' : '') +
            (eventCandidates.length ? '<div class="dup-list">' + eventCandidates.slice(0, 3).map(function(candidate){
              return '<a href="' + esc(candidate.url || '#meetups') + '" target="_blank" rel="noopener">' + esc(candidate.title) + '</a>';
            }).join('') + '</div>' : '');
        }

        if(snapshot){
          var todayCard = document.getElementById('today-card');
          if(todayCard){
            var ritual = todayCard.querySelector('.ritual');
            var title = todayCard.querySelector('h3');
            var body = todayCard.querySelector('p');
            var place = todayCard.querySelector('.t-place');
            if(ritual) ritual.textContent = snapshot.label || 'Daily update';
            if(title) title.textContent = 'Weather-aware plan: go early.';
            if(body) body.textContent = weatherSummary(snapshot) || body.textContent;
            if(place) place.innerHTML = '<b>Forecast</b> ' + (snapshot.source ? '<a href="' + esc(snapshot.source) + '" target="_blank" rel="noopener">Today&apos;s outlook</a>' : 'Today&apos;s outlook');
          }
          var uv = uvLabel(snapshot);
          if(uv){
            var statRows = Array.prototype.slice.call(document.querySelectorAll('.today-wx .stats div'));
            var uvRow = statRows.find(function(row){
              var label = row.querySelector('b');
              return label && /uv/i.test(label.textContent || '');
            });
            if(uvRow) uvRow.innerHTML = '<b>UV index</b>' + esc(uv);
          }
        }

        if(eventCandidates.length){
          var meetups = document.querySelector('.meetups');
          var cols = document.querySelectorAll('.meetups .ev-col');
          if(cols.length){
            var primary = cols[0];
            var secondary = cols[1];
            var firstThree = eventCandidates.slice(0, 3);
            var rest = eventCandidates.slice(3, 6);
            if(meetups) meetups.classList.toggle('is-single', !rest.length);
            primary.innerHTML = '<div class="ev-head">Best bets this week</div>' + firstThree.map(function(candidate){
              var badge = dateBadge(candidate.startsAt);
              var lane = candidateLane(candidate) || 'event';
              return '<a class="ev" href="' + esc(candidate.url || '#') + '" target="_blank" rel="noopener">' +
                '<div class="date"><span class="d">' + esc(badge.day) + '</span><span class="m">' + esc(badge.month) + '</span></div>' +
                '<div class="info"><h4>' + esc(candidate.title) + '</h4><div class="place">' + esc(candidate.location || 'Nature Coast') + ' <span class="pin">Details</span></div></div>' +
                '<span class="cat water">' + esc(lane.replace('-', ' ')) + '</span>' +
              '</a>';
            }).join('');
            if(secondary){
              secondary.hidden = !rest.length;
              secondary.innerHTML = rest.length ? '<div class="ev-head">More worth planning around</div>' + rest.map(function(candidate){
                var badge = dateBadge(candidate.startsAt);
                var lane = candidateLane(candidate) || 'event';
                return '<a class="ev" href="' + esc(candidate.url || '#') + '" target="_blank" rel="noopener">' +
                  '<div class="date"><span class="d">' + esc(badge.day) + '</span><span class="m">' + esc(badge.month) + '</span></div>' +
                  '<div class="info"><h4>' + esc(candidate.title) + '</h4><div class="place">' + esc(candidate.location || 'Nature Coast') + ' <span class="pin">Details</span></div></div>' +
                  '<span class="cat land">' + esc(lane.replace('-', ' ')) + '</span>' +
                '</a>';
              }).join('') : '';
            }
            var evNote = document.querySelector('.ev-note');
            if(evNote){
              evNote.textContent = 'Fresh picks, real details, and enough context to make a plan without opening twelve tabs.';
            }
          }
        }
        cleanPublicGuideCopy();
      }
      async function loadCityPulseData(){
        try {
          var response = await fetch('/api/city-pulse?city=nature-coast');
          if(!response.ok) throw new Error('City Pulse data unavailable');
          var data = await response.json();
          document.documentElement.dataset.contentSource = data.liveError ? 'seed-fallback' : 'city-pulse-api';
          applyHeroImage(heroFromHomepageSetting(data.homepage));

          if(data.issue){
            var issueLabel = data.issue.label || data.issue.slug || 'Explorer Issue';
            var iss = document.querySelector('.bar-cta .iss');
            if(iss) iss.textContent = issueLabel;
            var datelineIssue = document.querySelector('.mast .dateline span:nth-child(2)');
            if(datelineIssue) datelineIssue.textContent = issueLabel;
          }

          if(data.sources && data.sources.length){
            var footerSources = document.querySelector('footer .src');
            if(footerSources){
              footerSources.innerHTML =
                'The sharp weekly guide to Crystal River, Homosassa, Ocala, Gainesville, and the wild water in between.<br>' +
                'Built for people who want the good stuff fast.' + data.sources.slice(0, 0).map(function(source){
                  return '<a href="' + esc(source.url) + '" target="_blank" rel="noopener">' + esc(source.name) + '</a>';
              }).join(' · ');
            }
          }
          renderDailyUpdate(data);
          cleanPublicGuideCopy();
        } catch(error) {
          document.documentElement.dataset.contentSource = 'inline-fallback';
          cleanPublicGuideCopy();
          console.warn(error);
        }
      }
      loadCityPulseData();
      function renderDayTrips(){
        var archive = document.getElementById('daytrip-archive');
        if(!archive) return;
        archive.innerHTML = dayTrips.map(function(trip){
          var legs = trip.stops.map(function(stop, idx){
            return '<div class="leg">' +
              '<div class="leg-top"><span class="t">' + esc(stop[0]) + '</span></div>' +
              '<div class="dotline"><i></i>' + (idx < trip.stops.length - 1 ? '<span class="ln"></span>' : '') + '</div>' +
              '<h4>' + esc(stop[1]) + '</h4>' +
              '<p>' + esc(stop[2]) + '</p>' +
            '</div>';
          }).join('');
          var links = (trip.links || []).map(function(link){
            return '<a class="biz" href="' + esc(link[1]) + '" target="_blank" rel="noopener">' + esc(link[0]) + ' <span class="ar">↗</span></a>';
          }).join('');
          return '<article class="archive-trip rv">' +
            '<div class="archive-trip-head">' +
              '<div class="archive-trip-copy">' +
                '<div class="card-top"><span class="card-kicker">' + esc(trip.status) + ' · ' + esc(trip.issue) + '</span><span class="card-date">' + esc(trip.date) + '</span></div>' +
                '<h3>' + esc(trip.title) + '</h3>' +
                '<p>' + esc(trip.dek) + '</p>' +
                '<div class="card-tags">' + chips(trip.tags) + '</div>' +
              '</div>' +
              '<div class="ph"><img alt="' + esc(trip.imageLabel || trip.title) + '" data-photo src="' + esc(trip.image) + '"><span class="tag">PHOTO · ' + esc(trip.imageLabel || trip.title) + '</span></div>' +
            '</div>' +
            '<div class="trip">' + legs + '</div>' +
            '<div class="bizlinks"><span class="bl-label">Plan this itinerary</span><div class="bl-row">' + links + '<a class="biz sponsor" href="#advertise">Sponsor this itinerary <span class="tagad">Sponsor</span></a></div></div>' +
          '</article>';
        }).join('');
      }
      function renderEats(){
        var radar = document.getElementById('eats-radar');
        var evergreen = document.getElementById('eats-evergreen');
        if(!radar || !evergreen) return;
        function card(item){
          return '<article class="eat-card rv' + (item.featured ? ' featured' : '') + '">' +
            '<div class="ph eat-media"><img alt="' + esc(item.imageLabel || item.title) + '" data-photo src="' + esc(imageSrc(item)) + '"' + placePhotoAttrs(item) + '><span class="tag photo-credit">PHOTO · ' + esc(item.title) + '</span></div>' +
            '<div class="eat-body">' +
              '<div class="card-top"><span class="card-kicker">' + esc(item.lane) + '</span></div>' +
              '<h4>' + esc(item.title) + '</h4>' +
              '<p>' + esc(item.dek) + '</p>' +
              '<div class="rating-row"><span>' + esc(item.place) + '</span></div>' +
              '<div class="card-tags">' + chips(item.badges) + '</div>' +
              placeActions(item, 'eat-actions') +
            '</div>' +
          '</article>';
        }
        radar.innerHTML = eats.filter(function(item){ return item.featured; }).map(card).join('');
        evergreen.innerHTML = eats.filter(function(item){ return !item.featured; }).map(card).join('');
        document.querySelectorAll('#eats img[data-place-photo-meta]').forEach(function(img){
          fetch(img.getAttribute('data-place-photo-meta')).then(function(response){
            if(!response.ok) throw new Error('Place photo unavailable');
            return response.json();
          }).then(function(payload){
            var names = (payload.attributions || []).map(function(attr){ return attr.displayName; }).filter(Boolean);
            var credit = img.parentNode ? img.parentNode.querySelector('.photo-credit') : null;
            if(credit && names.length) credit.textContent = 'Photo: ' + names.join(', ');
          }).catch(function(){});
        });
      }
      renderDayTrips();
      renderEats();

      var weekPlanDetails = {
        0: {
          lane: 'Sunday reset',
          title: 'Riverside live music',
          time: 'Afternoon',
          place: 'Old Homosassa waterfront',
          summary: 'Use this as a loose, low-effort Sunday plan: find a waterfront music stop, sit outside, and keep the rest of the day flexible.',
          bestFor: 'Slow afternoon, casual food, easy people-watching.',
          note: 'Confirm the specific venue or event before driving; this slot is meant to point you toward the Homosassa waterfront mood.',
          learnLabel: 'Browse verified events',
          learnUrl: '#meetups',
          mapQuery: 'Old Homosassa waterfront, Homosassa, FL'
        },
        1: {
          lane: 'Start early',
          title: 'Sunrise float',
          time: '6:45am',
          place: 'Hunter Springs Park',
          summary: 'Go early for cooler air, easier parking, and a calmer launch before the day gets hot and busy.',
          bestFor: 'Swimming, paddling, clear-water photos, and an easy first stop.',
          note: 'City park rules, parking fees, and paddle-craft launch fees can apply.',
          learnLabel: 'Hunter Springs info',
          learnUrl: 'https://www.crystalriverfl.org/comserv/page/hunter-springs-park',
          mapQuery: 'Hunter Springs Park, Crystal River, FL'
        },
        2: {
          lane: 'Water + lunch',
          title: 'Paddle and lunch',
          time: 'Late morning into lunch',
          place: 'Kings Bay to downtown Crystal River',
          summary: 'Make the water the anchor, then keep lunch close so the plan does not turn into a parking-and-driving project.',
          bestFor: 'Visitors who want one clean Crystal River loop instead of five separate stops.',
          note: 'Use a public launch or a local outfitter, then pair the paddle with a downtown lunch stop.',
          learnLabel: 'Find kayak rentals',
          learnUrl: 'https://crystalriverkayakcompany.com/',
          mapQuery: 'Kings Bay Park, Crystal River, FL'
        },
        3: {
          lane: 'Wildlife window',
          title: 'Manatees, early',
          time: 'Early morning',
          place: 'Three Sisters Springs',
          summary: 'This is the postcard move: go before the day crowds in, and check access rules before you assume you can walk or paddle into a specific area.',
          bestFor: 'Clear-water viewing, wildlife awareness, first-time Crystal River visitors.',
          note: 'Access varies by land/water route and season. Start with the official visitor info.',
          learnLabel: 'Three Sisters info',
          learnUrl: 'https://www.crystalriverfl.org/node/110',
          mapQuery: 'Three Sisters Springs, Crystal River, FL'
        },
        4: {
          lane: 'Sunset drive',
          title: 'Ozello sunset drive',
          time: 'Golden hour',
          place: 'Peck\'s Old Port Cove',
          summary: 'Take the Ozello Trail when the marsh light gets good, then finish with seafood instead of rushing back inland.',
          bestFor: 'Date night, seafood, marsh views, visitors who want the old-Florida texture.',
          note: 'Leave a little extra time for the drive; the road is part of the plan.',
          learnLabel: 'Peck\'s website',
          learnUrl: 'https://pecksoldportcove.com/',
          mapQuery: 'Peck\'s Old Port Cove, Crystal River, FL'
        },
        5: {
          lane: 'Evening browse',
          title: 'Market night',
          time: '5-9pm',
          place: 'Downtown Inverness / Town Square',
          summary: 'Treat this as an easy after-work wander: downtown, food nearby, and a simple way to see what Inverness has going on.',
          bestFor: 'Browsing, dinner nearby, music or small-town event energy.',
          note: 'Check the city calendar for the exact listing before making a special trip.',
          learnLabel: 'Inverness calendar',
          learnUrl: 'https://inverness.gov/Calendar/',
          mapQuery: 'Downtown Inverness Town Square, Inverness, FL'
        },
        6: {
          lane: 'Community water day',
          title: 'Cleanup and long swim',
          time: '8am',
          place: 'Kings Bay Park',
          summary: 'Start with the useful community piece, then keep the morning open for a swim, a paddle, or a shaded walk near the bay.',
          bestFor: 'Volunteering, water access, simple family-friendly outdoor time.',
          note: 'Kings Bay Park has posted hours, amenities, parking details, and launch-fee notes on the city page.',
          learnLabel: 'Kings Bay Park info',
          learnUrl: 'https://www.crystalriverfl.org/comserv/page/kings-bay-park',
          mapQuery: 'Kings Bay Park, Crystal River, FL'
        }
      };

      function googleDirectionsUrl(query){
        return 'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(query || 'Florida Nature Coast');
      }
      function ensureDayModal(){
        var modal = document.getElementById('day-detail-modal');
        if(modal) return modal;
        modal = document.createElement('dialog');
        modal.id = 'day-detail-modal';
        modal.className = 'day-modal';
        modal.innerHTML =
          '<div class="day-modal-card" role="document">' +
            '<button class="day-modal-close" type="button" aria-label="Close details">x</button>' +
            '<div class="dm-kicker" id="day-modal-kicker"></div>' +
            '<h3 id="day-modal-title"></h3>' +
            '<p class="dm-meta" id="day-modal-meta"></p>' +
            '<p class="dm-summary" id="day-modal-summary"></p>' +
            '<dl class="dm-list">' +
              '<div><dt>Best for</dt><dd id="day-modal-best"></dd></div>' +
              '<div><dt>Heads up</dt><dd id="day-modal-note"></dd></div>' +
            '</dl>' +
            '<div class="dm-actions">' +
              '<a class="btn" id="day-modal-learn" href="#">Learn more</a>' +
              '<a class="btn earth" id="day-modal-map" href="#" target="_blank" rel="noopener">Get directions</a>' +
            '</div>' +
          '</div>';
        document.body.appendChild(modal);
        modal.querySelector('.day-modal-close').addEventListener('click', function(){ modal.close(); });
        modal.addEventListener('click', function(event){
          if(event.target === modal) modal.close();
        });
        modal.querySelector('#day-modal-learn').addEventListener('click', function(event){
          var href = this.getAttribute('href') || '';
          if(href.charAt(0) === '#'){
            event.preventDefault();
            modal.close();
            var target = document.getElementById(href.slice(1));
            if(target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        });
        return modal;
      }
      function openDayModal(cell, cellDate){
        var detail = weekPlanDetails[Number(cell.getAttribute('data-day'))] || {};
        var title = detail.title || (cell.querySelector('.dc-pick') ? cell.querySelector('.dc-pick').childNodes[0].textContent : 'This week');
        var dateLabel = cellDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
        var modal = ensureDayModal();
        modal.querySelector('#day-modal-kicker').textContent = detail.lane || 'This week';
        modal.querySelector('#day-modal-title').textContent = title;
        modal.querySelector('#day-modal-meta').textContent = dateLabel + ' / ' + (detail.time || 'Flexible timing') + ' / ' + (detail.place || 'Nature Coast');
        modal.querySelector('#day-modal-summary').textContent = detail.summary || 'A useful day-by-day pick from this week\'s guide.';
        modal.querySelector('#day-modal-best').textContent = detail.bestFor || 'A simple local plan.';
        modal.querySelector('#day-modal-note').textContent = detail.note || 'Check conditions before heading out.';
        var learn = modal.querySelector('#day-modal-learn');
        learn.textContent = detail.learnLabel || 'Learn more';
        learn.href = detail.learnUrl || '#meetups';
        learn.target = detail.learnUrl && detail.learnUrl.charAt(0) === '#' ? '' : '_blank';
        if(learn.target) learn.rel = 'noopener'; else learn.removeAttribute('rel');
        modal.querySelector('#day-modal-map').href = googleDirectionsUrl(detail.mapQuery || detail.place || title);
        if(typeof modal.showModal === 'function') modal.showModal();
        else modal.setAttribute('open', '');
        modal.querySelector('.day-modal-close').focus();
      }
      function initTodayModule(){
        var date = new Date();
        var names = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
        var month = date.toLocaleDateString(undefined, { month:'long' });
        var todayCard = document.getElementById('today-card');
        var dayName = todayCard ? todayCard.querySelector('.day-name') : null;
        var dayDate = todayCard ? todayCard.querySelector('.day-date') : null;
        if(dayName) dayName.textContent = names[date.getDay()];
        if(dayDate) dayDate.textContent = month + ' ' + date.getDate();
        var today = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        var weekRail = document.querySelector('.weekrail');
        var cells = Array.prototype.slice.call(document.querySelectorAll('.daycell'));
        cells.map(function(cell){
          var day = Number(cell.getAttribute('data-day'));
          var offset = (day - today.getDay() + 7) % 7;
          if(offset === 6) offset = -1;
          return { cell: cell, offset: offset };
        }).sort(function(a, b){
          return a.offset - b.offset;
        }).forEach(function(item){
          var cellDate = new Date(today);
          cellDate.setDate(today.getDate() + item.offset);
          var shortDay = cellDate.toLocaleDateString(undefined, { weekday: 'short' });
          var dayNumber = String(cellDate.getDate());
          var dayLabel = item.cell.querySelector('.dc-day .dn');
          var dateLabel = item.cell.querySelector('.dc-day .dd');
          if(dayLabel) dayLabel.textContent = shortDay;
          if(dateLabel) dateLabel.textContent = dayNumber;
          item.cell.classList.toggle('is-yesterday', item.offset === -1);
          item.cell.classList.toggle('is-today', item.offset === 0);
          item.cell.classList.toggle('is-tomorrow', item.offset === 1);
          item.cell.classList.toggle('is-future', item.offset > 0);
          item.cell.setAttribute('data-relative-day', String(item.offset));
          if(item.offset === 0){
            item.cell.setAttribute('aria-current', 'date');
          } else {
            item.cell.removeAttribute('aria-current');
          }
          var detailForCell = weekPlanDetails[Number(item.cell.getAttribute('data-day'))];
          item.cell.setAttribute('role', 'button');
          item.cell.setAttribute('tabindex', '0');
          item.cell.setAttribute('aria-label', 'Open details for ' + (detailForCell ? detailForCell.title : 'this day') + ' on ' + cellDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }));
          item.cell.addEventListener('click', function(){ openDayModal(item.cell, cellDate); });
          item.cell.addEventListener('keydown', function(event){
            if(event.key === 'Enter' || event.key === ' '){
              event.preventDefault();
              openDayModal(item.cell, cellDate);
            }
          });
          if(weekRail) weekRail.appendChild(item.cell);
        });
      }
      initTodayModule();

      function initWeatherWeek(){
        var today = new Date();
        today = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        document.querySelectorAll('.weekfc .day').forEach(function(day, index){
          var offset = Number(day.getAttribute('data-forecast-offset'));
          if(Number.isNaN(offset)) offset = index;
          var forecastDate = new Date(today);
          forecastDate.setDate(today.getDate() + offset);
          var label = day.querySelector('.dn');
          var dow = label ? label.querySelector('.dow') : null;
          var dnum = label ? label.querySelector('.dnum') : null;
          if(label && !dow){
            label.innerHTML = '<span class="dow"></span><span class="dnum"></span>';
            dow = label.querySelector('.dow');
            dnum = label.querySelector('.dnum');
          }
          if(dow) dow.textContent = forecastDate.toLocaleDateString(undefined, { weekday: 'short' });
          if(dnum) dnum.textContent = String(forecastDate.getDate());
          day.classList.toggle('is-weather-today', offset === 0);
        });
      }
      initWeatherWeek();

      function setActiveSection(id){
        railLinks.forEach(function(l){ l.classList.toggle('active', l.getAttribute('data-target') === id); });
        weekNavLinks.forEach(function(l){ l.classList.toggle('active', l.getAttribute('data-target') === id); });
        if(sectionPicker && id && sectionPicker.value !== id) sectionPicker.value = id;
      }
      function currentSectionId(){
        var doc = document.documentElement;
        if(window.scrollY + window.innerHeight >= doc.scrollHeight - 4){
          return sections[sections.length - 1] ? sections[sections.length - 1].id : null;
        }
        var viewportTop = bar ? bar.getBoundingClientRect().bottom : 0;
        var viewportBottom = window.innerHeight;
        var current = null;
        var bestScore = -Infinity;
        sections.forEach(function(section){
          var rect = section.getBoundingClientRect();
          var visible = Math.max(0, Math.min(rect.bottom, viewportBottom) - Math.max(rect.top, viewportTop));
          var nearHeader = Math.max(0, 120 - Math.abs(rect.top - viewportTop));
          var score = visible + nearHeader;
          if(score > bestScore){
            bestScore = score;
            current = section;
          }
        });
        return current ? current.id : null;
      }
      function onScroll(){
        var st = window.scrollY || document.documentElement.scrollTop;
        var h = document.documentElement.scrollHeight - window.innerHeight;
        progress.style.width = (h > 0 ? (st / h) * 100 : 0) + '%';
        bar.classList.toggle('stuck', st > 12);
        setActiveSection(currentSectionId());
      }
      window.addEventListener('scroll', onScroll, { passive:true });
      onScroll();
      if(location.hash){
        window.setTimeout(function(){
          var target = document.getElementById(location.hash.slice(1));
          if(target){
            target.scrollIntoView({ block:'start', behavior:'auto' });
            onScroll();
          }
        }, 80);
      }

      var rio = new IntersectionObserver(function(entries){
        entries.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); rio.unobserve(e.target); } });
      }, { threshold:0.12, rootMargin:'0px 0px -8% 0px' });
      document.querySelectorAll('.rv').forEach(function(el){ rio.observe(el); });

      /* photos: reveal real img, fall back to labeled placeholder on error */
      document.querySelectorAll('img[data-photo]').forEach(function(img){
        function ok(){ img.classList.add('loaded'); var ph = img.closest('.ph'); if(ph) ph.classList.add('has-img'); }
        function fail(){ if(img.parentNode) img.parentNode.removeChild(img); }
        if(img.complete && img.naturalWidth > 0){ ok(); }
        else if(img.complete && img.naturalWidth === 0){ fail(); }
        img.addEventListener('load', ok);
        img.addEventListener('error', fail);
      });

      /* day-trip gamification */
      var legs = Array.prototype.slice.call(document.querySelectorAll('#trip .leg'));
      var badge = document.getElementById('badge');
      var legcount = document.getElementById('legcount');
      var legbar = document.getElementById('legbar');
      var resetBtn = document.getElementById('resetlegs');
      var costLo = document.getElementById('cost-lo');
      var costHi = document.getElementById('cost-hi');
      var TKEY = 'ncp_trip_kingsbay';
      var done = {};
      try { done = JSON.parse(localStorage.getItem(TKEY) || '{}') || {}; } catch(e){ done = {}; }

      function persist(){ try { localStorage.setItem(TKEY, JSON.stringify(done)); } catch(e){} }
      function render(animate){
        var count = 0;
        var lo = 0;
        var hi = 0;
        legs.forEach(function(leg){
          var id = leg.getAttribute('data-leg');
          var isDone = !!done[id];
          leg.classList.toggle('done', isDone);
          if(isDone) count++;
          lo += Number(leg.getAttribute('data-lo') || 0);
          hi += Number(leg.getAttribute('data-hi') || 0);
        });
        legcount.textContent = String(count);
        legbar.style.width = (count/legs.length*100) + '%';
        if(costLo) costLo.textContent = String(lo);
        if(costHi) costHi.textContent = String(hi);
        resetBtn.hidden = count === 0;
        if(count === legs.length){ badge.classList.add('show'); }
        else { badge.classList.remove('show'); }
      }
      function toggle(leg){
        var id = leg.getAttribute('data-leg');
        if(done[id]) delete done[id]; else done[id] = 1;
        persist(); render(true);
      }
      legs.forEach(function(leg){
        leg.addEventListener('click', function(){ toggle(leg); });
      });
      resetBtn.addEventListener('click', function(ev){ ev.stopPropagation(); done = {}; persist(); render(); });
      render(false);

      /* reader tip flow */
      var tipForm = document.getElementById('tipform');
      var tipOk = document.getElementById('tip-ok');
      if(tipForm && tipOk){
        tipForm.addEventListener('submit', function(ev){
          ev.preventDefault();
          var spot = document.getElementById('tip-spot');
          if(!spot || !spot.value.trim()){
            if(spot) spot.focus();
            return;
          }
          var tip = {
            spot: spot.value.trim(),
            note: (document.getElementById('tip-note') || {}).value || '',
            name: (document.getElementById('tip-name') || {}).value || '',
            email: (document.getElementById('tip-email') || {}).value || '',
            at: new Date().toISOString()
          };
          try {
            var list = JSON.parse(localStorage.getItem('ncp_reader_tips') || '[]');
            list.unshift(tip);
            localStorage.setItem('ncp_reader_tips', JSON.stringify(list.slice(0, 20)));
          } catch(e){}
          tipForm.classList.add('hide');
          tipOk.classList.add('show');
        });
      }

      /* masthead photo submission flow */
      var photoForm = document.getElementById('photoform');
      var photoOk = document.getElementById('photo-ok');
      var photoFile = document.getElementById('photo-file');
      var photoFileName = document.getElementById('photo-file-name');
      if(photoFile && photoFileName){
        photoFile.addEventListener('change', function(){
          var file = photoFile.files && photoFile.files[0];
          photoFileName.textContent = file ? file.name : 'JPEG, PNG, or WebP up to 8MB';
        });
      }
      function fileToDataUrl(file){
        return new Promise(function(resolve, reject){
          var reader = new FileReader();
          reader.onload = function(){ resolve(reader.result); };
          reader.onerror = function(){ reject(reader.error || new Error('Could not read image.')); };
          reader.readAsDataURL(file);
        });
      }
      if(photoForm && photoOk && photoFile){
        photoForm.addEventListener('submit', async function(ev){
          ev.preventDefault();
          var file = photoFile.files && photoFile.files[0];
          var name = document.getElementById('photo-name');
          var email = document.getElementById('photo-email');
          var permission = document.getElementById('photo-permission');
          if(!name || !name.value.trim()){ if(name) name.focus(); return; }
          if(!email || !email.value.trim()){ if(email) email.focus(); return; }
          if(!file){ photoFile.focus(); return; }
          if(file.size > 8 * 1024 * 1024){
            if(photoFileName) photoFileName.textContent = 'That file is over 8MB.';
            return;
          }
          if(!permission || !permission.checked){ if(permission) permission.focus(); return; }
          var button = photoForm.querySelector('button[type="submit"]');
          var original = button ? button.textContent : '';
          if(button){ button.disabled = true; button.textContent = 'Submitting...'; }
          try {
            var dataUrl = await fileToDataUrl(file);
            var response = await fetch('/api/submit-photo', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                city: 'nature-coast',
                photographerName: name.value.trim(),
                email: email.value.trim(),
                location: (document.getElementById('photo-location') || {}).value || '',
                credit: (document.getElementById('photo-credit') || {}).value || '',
                caption: (document.getElementById('photo-caption') || {}).value || '',
                contentType: file.type,
                dataBase64: dataUrl,
                permission: true,
                discountOptIn: Boolean((document.getElementById('photo-discount') || {}).checked)
              })
            });
            var result = await response.json().catch(function(){ return {}; });
            if(!response.ok) throw new Error(result.error || 'Photo submission failed.');
            photoForm.classList.add('hide');
            photoOk.classList.add('show');
          } catch(error) {
            if(photoFileName) photoFileName.textContent = error.message || 'Photo submission failed.';
          } finally {
            if(button){ button.disabled = false; button.textContent = original; }
          }
        });
      }

      /* join flow */
      var form = document.getElementById('joinform');
      var confirmed = document.getElementById('confirmed');
      var detail = document.getElementById('confirm-detail');
      var emailEl = document.getElementById('email');
      var KEY = 'ncp_explorer_email';
      function showConfirmed(email){
        form.classList.add('hide'); confirmed.classList.add('show');
        detail.textContent = 'Issue 002 is headed to ' + email + ' this Friday.';
      }
      var saved = null;
      try { saved = localStorage.getItem(KEY); } catch(e){}
      if(saved){ showConfirmed(saved); }
      form.addEventListener('submit', async function(ev){
        ev.preventDefault();
        var val = (emailEl.value || '').trim();
        if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(val)){ emailEl.focus(); emailEl.style.borderColor = 'oklch(0.6 0.18 25)'; return; }
        try {
          var response = await fetch('/api/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: val,
              city: 'nature-coast',
              source: 'site-signup',
              path: location.pathname,
              userAgent: navigator.userAgent
            })
          });
          var result = await response.json().catch(function(){ return {}; });
          if(!response.ok) throw new Error(result.error || 'Signup is unavailable right now.');
          try { localStorage.setItem(KEY, val); } catch(e){}
          showConfirmed(val);
        } catch(error) {
          detail.textContent = error.message || 'Signup is unavailable right now.';
          confirmed.classList.add('show');
        }
      });
    })();
