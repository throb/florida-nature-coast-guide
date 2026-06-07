window.NCP_GUIDE = (function(){
  var dayTrips = [
    {
      issue: 'Issue 001',
      date: 'June 4, 2026',
      status: 'This week',
      title: 'Kings Bay Clear-Water Loop',
      dek: 'A bright, easy Crystal River day: clear kayak or snorkel early, local lunch, Hunter Springs float, and a Fort Island sunset.',
      image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Crystal_River_near_Hunter_Spring_Run_-_panoramio.jpg?width=1200',
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
      image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Silver_Springs_State_Park_-_Headspring_Entrance_Sign.jpg?width=1200',
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
      image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Crystal_River_Preserve_State_Park_2.jpg?width=1200',
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
      image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Dolphin_at_Fort_Island_Gulf_Beach.jpg?width=1200',
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
      place: 'Ozello Trail - seafood',
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
      place: 'Ozello - seafood',
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
      place: 'Homosassa - tiki bar',
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
      place: 'Crystal River - breakfast',
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
      place: 'Crystal River - lunch',
      badges: ['Local', 'Lunch', 'Loop stop'],
      href: 'https://m.facebook.com/SadiesCornerKitchen/',
      websiteUrl: 'https://m.facebook.com/SadiesCornerKitchen/',
      mapQuery: 'Sadie\'s Corner Kitchen Crystal River FL',
      placePhotoQuery: 'Sadie\'s Corner Kitchen Crystal River FL',
      image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Crystal_River_in_Crystal_River05.jpg?width=1000',
      imageLabel: 'Sadie\'s Corner Kitchen'
    }
  ];

  var mealStops = [
    {
      slot: 'Breakfast',
      title: 'The Biscuit Barn',
      area: 'Crystal River',
      timing: 'Before water',
      dek: 'Biscuits and breakfast plates before springs, paddles, or errands.',
      href: 'https://www.biscuitbarn.net/',
      websiteUrl: 'https://www.biscuitbarn.net/',
      mapQuery: 'The Biscuit Barn Crystal River FL',
      placePhotoQuery: 'The Biscuit Barn Crystal River FL',
      image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Crystal_Street_in_Crystal_River,_Florida.jpg?width=1000',
      imageLabel: 'The Biscuit Barn',
      layout: 'lead',
      badges: ['Breakfast', 'Local', 'Quick start']
    },
    {
      slot: 'Coffee + pastry',
      title: 'Cattle Dog Coffee Roasters',
      area: 'Crystal River / Homosassa / Inverness',
      timing: 'First stop',
      dek: 'Coffee, pastries, breakfast, lunch, and weekend brunch fuel.',
      href: 'https://www.cattledogcoffeeroasters.net/',
      websiteUrl: 'https://www.cattledogcoffeeroasters.net/',
      mapQuery: 'Cattle Dog Coffee Roasters Crystal River FL',
      placePhotoQuery: 'Cattle Dog Coffee Roasters Crystal River FL',
      image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Crystal_River_in_Crystal_River05.jpg?width=1000',
      imageLabel: 'Cattle Dog Coffee Roasters',
      layout: 'portrait',
      badges: ['Coffee', 'Pastries', 'Weekend brunch']
    },
    {
      slot: 'Lunch',
      title: 'Sadie\'s Corner Kitchen',
      area: 'Crystal River',
      timing: 'Midday reset',
      dek: 'A small, easy lunch stop for sandwiches and baked goods.',
      href: 'https://m.facebook.com/SadiesCornerKitchen/',
      websiteUrl: 'https://m.facebook.com/SadiesCornerKitchen/',
      mapQuery: 'Sadie\'s Corner Kitchen Crystal River FL',
      placePhotoQuery: 'Sadie\'s Corner Kitchen Crystal River FL',
      image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Crystal_River_near_Hunter_Spring_Run_-_panoramio.jpg?width=1000',
      imageLabel: 'Sadie\'s Corner Kitchen',
      layout: 'square',
      badges: ['Lunch', 'Sandwiches', 'Low friction']
    },
    {
      slot: 'Waterfront lunch',
      title: 'Waterfront Social',
      area: 'Crystal River',
      timing: 'Lunch or drinks',
      dek: 'Coastal plates, handhelds, shrimp, and drinks near the water.',
      href: 'https://waterfrontsocialcr.com/menu/',
      websiteUrl: 'https://waterfrontsocialcr.com/menu/',
      mapQuery: 'Waterfront Social Crystal River FL',
      placePhotoQuery: 'Waterfront Social Crystal River FL',
      image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Dolphin_at_Fort_Island_Gulf_Beach.jpg?width=1000',
      imageLabel: 'Waterfront Social',
      layout: 'wide',
      badges: ['Waterfront', 'Lunch', 'Cocktails']
    },
    {
      slot: 'Dinner',
      title: 'Peck\'s Old Port Cove',
      area: 'Ozello',
      timing: 'Golden hour',
      dek: 'Classic Ozello seafood after the marsh drive.',
      href: 'https://pecksoldportcove.com/',
      websiteUrl: 'https://pecksoldportcove.com/',
      mapQuery: 'Peck\'s Old Port Cove Crystal River FL',
      placePhotoQuery: 'Peck\'s Old Port Cove Crystal River FL',
      image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Crystal_River_Preserve_State_Park_2.jpg?width=1000',
      imageLabel: 'Peck\'s Old Port Cove',
      layout: 'tall',
      badges: ['Seafood', 'Sunset', 'Drive-worthy']
    },
    {
      slot: 'Dinner date',
      title: 'Vintage on 5th',
      area: 'Crystal River',
      timing: 'Evening',
      dek: 'Downtown dinner, wine, and a slower post-outdoor pace.',
      href: 'https://www.vintageon5th.com/',
      websiteUrl: 'https://www.vintageon5th.com/',
      mapQuery: 'Vintage on 5th Crystal River FL',
      placePhotoQuery: 'Vintage on 5th Crystal River FL',
      image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Crystal_Street_in_Crystal_River,_Florida.jpg?width=1000',
      imageLabel: 'Vintage on 5th',
      layout: 'portrait',
      badges: ['Dinner', 'Wine', 'Downtown']
    },
    {
      slot: 'Weekend brunch',
      title: 'Cattle Dog Brunch - Hernando',
      area: 'Hernando',
      timing: 'Sat-Sun 9-1',
      dek: 'Weekend brunch and coffee before a slower explore day.',
      href: 'https://www.cattledogcoffeeroasters.net/',
      websiteUrl: 'https://www.cattledogcoffeeroasters.net/',
      mapQuery: 'Cattle Dog Coffee Roasters Hernando FL',
      placePhotoQuery: 'Cattle Dog Coffee Roasters Hernando FL',
      image: 'https://commons.wikimedia.org/wiki/Special:FilePath/FlHunterSpring.jpg?width=1000',
      imageLabel: 'Cattle Dog Coffee Roasters Hernando',
      layout: 'small',
      badges: ['Brunch', 'Weekend', 'Coffee']
    },
    {
      slot: 'Snacks',
      title: 'Mimi\'s Bakehouse',
      area: 'Crystal River',
      timing: 'Sweet pause',
      dek: 'Cakes, cookies, pastries, and a quick sweet pause.',
      href: 'https://www.mimibakehouse.com/',
      websiteUrl: 'https://www.mimibakehouse.com/',
      mapQuery: 'Mimi\'s Bakehouse Crystal River FL',
      placePhotoQuery: 'Mimi\'s Bakehouse Crystal River FL',
      image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Downtownocalafl.jpg?width=1000',
      imageLabel: 'Mimi\'s Bakehouse',
      layout: 'square',
      badges: ['Bakery', 'Dessert', 'Downtown']
    },
    {
      slot: 'Cold treat',
      title: 'Crystal Cream Rolls',
      area: 'Crystal River',
      timing: 'After lunch',
      dek: 'Rolled ice cream for the hot after-lunch wander.',
      href: 'https://crystalcreamrolls.com/',
      websiteUrl: 'https://crystalcreamrolls.com/',
      mapQuery: 'Crystal Cream Rolls Crystal River FL',
      placePhotoQuery: 'Crystal Cream Rolls Crystal River FL',
      image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Rainbow_spgs_florida.JPG?width=1000',
      imageLabel: 'Crystal Cream Rolls',
      layout: 'small',
      badges: ['Ice cream', 'Snack', 'Heat relief']
    },
    {
      slot: 'Drinks / cocktails',
      title: 'Crumps\' Landing',
      area: 'Homosassa',
      timing: 'Late afternoon',
      dek: 'Waterfront cocktails, local beer, food, and a big outdoor setting.',
      href: 'https://crumpslanding.com/',
      websiteUrl: 'https://crumpslanding.com/',
      mapQuery: 'Crumps Landing Homosassa FL',
      placePhotoQuery: 'Crumps Landing Homosassa FL',
      image: 'https://commons.wikimedia.org/wiki/Special:FilePath/The_fish_market_in_Homosassa,_Florida.jpg?width=1000',
      imageLabel: 'Crumps\' Landing',
      layout: 'wide',
      badges: ['Cocktails', 'Waterfront', 'Homosassa']
    }
  ];

  var foodPlans = [
    {
      title: 'Clear-water day',
      dek: 'Built for a Crystal River morning that starts early and stays flexible.',
      image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Crystal_River_near_Hunter_Spring_Run_-_panoramio.jpg?width=1000',
      imageLabel: 'Crystal River clear-water morning',
      stops: [
        { label: 'Breakfast', title: 'The Biscuit Barn', websiteUrl: 'https://www.biscuitbarn.net/', mapQuery: 'The Biscuit Barn Crystal River FL' },
        { label: 'Lunch', title: 'Sadie\'s Corner Kitchen', websiteUrl: 'https://m.facebook.com/SadiesCornerKitchen/', mapQuery: 'Sadie\'s Corner Kitchen Crystal River FL' },
        { label: 'Sweet stop', title: 'Mimi\'s Bakehouse', websiteUrl: 'https://www.mimibakehouse.com/', mapQuery: 'Mimi\'s Bakehouse Crystal River FL' },
        { label: 'Drinks', title: 'Waterfront Social', websiteUrl: 'https://waterfrontsocialcr.com/menu/', mapQuery: 'Waterfront Social Crystal River FL' }
      ]
    },
    {
      title: 'Ozello sunset run',
      dek: 'A food loop that saves the best light for the marsh road.',
      image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Crystal_River_Preserve_State_Park_2.jpg?width=1000',
      imageLabel: 'Ozello marsh sunset route',
      stops: [
        { label: 'Coffee', title: 'Cattle Dog Coffee Roasters', websiteUrl: 'https://www.cattledogcoffeeroasters.net/', mapQuery: 'Cattle Dog Coffee Roasters Crystal River FL' },
        { label: 'Lunch', title: 'Backwater Fins', websiteUrl: 'https://backwater-fins.com/', mapQuery: 'Backwater Fins Ozello FL' },
        { label: 'Dinner', title: 'Peck\'s Old Port Cove', websiteUrl: 'https://pecksoldportcove.com/', mapQuery: 'Peck\'s Old Port Cove Crystal River FL' },
        { label: 'Nightcap', title: 'Crumps\' Landing', websiteUrl: 'https://crumpslanding.com/', mapQuery: 'Crumps Landing Homosassa FL' }
      ]
    },
    {
      title: 'Downtown nibble crawl',
      dek: 'For a slower day around Crystal River with small stops instead of one big meal.',
      image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Crystal_Street_in_Crystal_River,_Florida.jpg?width=1000',
      imageLabel: 'Downtown Crystal River crawl',
      stops: [
        { label: 'Coffee', title: 'Cattle Dog Coffee Roasters', websiteUrl: 'https://www.cattledogcoffeeroasters.net/', mapQuery: 'Cattle Dog Coffee Roasters Crystal River FL' },
        { label: 'Lunch', title: 'Sadie\'s Corner Kitchen', websiteUrl: 'https://m.facebook.com/SadiesCornerKitchen/', mapQuery: 'Sadie\'s Corner Kitchen Crystal River FL' },
        { label: 'Cold treat', title: 'Crystal Cream Rolls', websiteUrl: 'https://crystalcreamrolls.com/', mapQuery: 'Crystal Cream Rolls Crystal River FL' },
        { label: 'Dinner', title: 'Vintage on 5th', websiteUrl: 'https://www.vintageon5th.com/', mapQuery: 'Vintage on 5th Crystal River FL' }
      ]
    }
  ];

  function esc(str){
    return String(str == null ? '' : str).replace(/[&<>"']/g, function(ch){
      return ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[ch];
    });
  }

  function chips(items){
    return (items || []).map(function(item){
      return '<span class="chip">' + esc(item) + '</span>';
    }).join('');
  }

  return { dayTrips: dayTrips, eats: eats, mealStops: mealStops, foodPlans: foodPlans, esc: esc, chips: chips };
})();
