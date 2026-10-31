const V = {
  coffee: ["Coffee machine guide", "https://youtube.com/watch?v=dJfvRSSlnaE"],
  coffeeClean: ["Coffee cleaning cycle", "https://www.youtube.com/watch?v=kB_czudrKo0"],
  knives: ["Sharpening the knives", "https://www.youtube.com/watch?v=NYa9Qw3DeNA"],
  fryer: ["Air fryer cleaning", "https://www.youtube.com/watch?v=bo8HF0XfkN8"],
  sleep: ["Eight Sleep bed", "https://www.youtube.com/watch?v=tnbu4eYN6W4"],
  dyson: ["Dyson vacuum care", "https://www.youtube.com/watch?v=Gj7hvyrVbZw"],
  robot: ["Robot vacuum care", "https://www.youtube.com/watch?v=_cDopg3MjnA"],
  grillBrush: ["Brush demo · 3 min (similar model)", "https://www.youtube.com/watch?v=9ycJS4dVpus"],
  stainforceUse: ["Shark · how to use", "https://www.youtube.com/watch?v=uecQ3ylcVos"],
  stainforceCare: ["Shark · clean & care · 2:35", "https://www.youtube.com/watch?v=-WyoxLZ8NF8"],
  dysonPurifier: ["Dyson HushJet · cleaning & care", "https://www.youtube.com/watch?v=3-BZ2eUvjrc"],
  cowayPre: ["Coway · clean the pre-filters", "https://www.youtube.com/watch?v=urOsdoAhJRY"],
  cowayMax: ["Coway · replace the Max2 filters", "https://www.youtube.com/watch?v=bgFCcMooOYw"],
  cowaySensor: ["Coway · sensors & air outlet", "https://www.youtube.com/watch?v=P6YiFeZnbwQ"],
};
const P = (src, cap, bad) => ({ src: "img/" + src + ".jpg", cap, bad: !!bad });
const DONE = (what) => ({ src: null, cap: "<b>Perfect:</b> " + what + ". Photo to be inserted." });
const PERFECT = { src: null, cap: "<b>Perfect:</b> photo to be inserted after the first clean." };
const GRILL_BRUSH_GUIDE = '<b>Your Green Lion GL-CB5 electric grill brush.</b><ol class="guide-steps">' +
  '<li><b>Get ready.</b> Gas off; grill completely cool. Charge the brush, then unplug it. With the brush off, check that the roller is secure and has no loose wires. Wear the supplied gloves.</li>' +
  '<li><b>Add water.</b> Fill the tank with plain warm water (no hotter than 60°C) and fit it firmly.</li>' +
  '<li><b>Brush gently.</b> Use on uncoated metal grates only. Keep the roller parallel to the grate bars and move slowly. Let the motor work; do not force it. If it stops, release pressure before restarting.</li>' +
  '<li><b>Check the grates.</b> Switch off. Remove all loosened grease and any loose wires. Rinse or wipe the grates clean, then dry them.</li>' +
  '<li><b>Put away.</b> Hand-rinse the brush, wipe the body and let everything dry. Keep the charging port dry. Recharge with a 5V supply and store in its case.</li></ol>' +
  '<p>Keep this brush away from the tabletop, burner openings, coated surfaces and polished exterior steel.</p>' +
  '<a class="guide-source" href="https://www.greenlion.net/blog/green-lion-guides-183/gncb5grilbrbk-2898" target="_blank" rel="noopener">Green Lion instructions ↗</a>';

const STAINFORCE_GUIDE = '<b>Your Shark StainForce HX101.</b><p>For small carpet, rug and upholstery stains. Use the separate Shark StainForce spray bottle; no mixing or measuring.</p>' +
  '<b>Before you start</b><p>Check the fabric label: W or WS only. Skip S, X, dry-clean-only or unlabelled delicate rugs. Test a hidden patch first. Unsure? Ask Michael. Never use on hard floors or Eight Sleep covers.</p>' +
  '<b>Remove a stain</b><ol class="guide-steps">' +
  '<li><b>Prepare.</b> Charge, then unplug. Check the tank, tool and filters are fitted. Suction up wet spills first; vacuum loose dry dirt with the Dyson.</li>' +
  '<li><b>Spray, scrub, extract.</b> Apply StainForce solution generously from about 5 cm away. Let it soak a few minutes; spray again. Scrub with the bristles flat. Tilt the handle up, press down and pull slowly backwards to extract. Leave the fabric to dry.</li></ol>' +
  '<b>After every use</b><ol class="guide-steps">' +
  '<li><b>Self-rinse.</b> Empty the dirty tank. Fill the removable caddy cup with clean water to MAX. Fit the stain tool, place it in the cup and switch on to draw water through. Remove, switch off and empty again.</li>' +
  '<li><b>Clean and dry.</b> Unplug before dismantling. Follow the care video to remove the separator and wash the empty tank. Rinse the tool and filters; water only for the foam filter. Air-dry fully, refit, store indoors and recharge with the supplied charger.</li></ol>' +
  '<p>Keep the handle and charging port dry. No bleach, vinegar or other cleaners in the spray bottle. Never store dirty water.</p>' +
  '<p><a class="guide-source" href="' + V.stainforceUse[1] + '" target="_blank" rel="noopener">Watch: how to use ↗</a><br><a class="guide-source" href="' + V.stainforceCare[1] + '" target="_blank" rel="noopener">Watch: clean &amp; care (2:35) ↗</a></p>' +
  '<a class="guide-source" href="https://media.flixcar.com/webp/synd-asset/Shark-390018373-ViewProductAttachment-OpenFile-LocaleId--DirectoryPath--FileName-HX100UKTplusIB.pdf" target="_blank" rel="noopener">Shark StainForce series manual ↗</a>' +
  '<p class="photo-credit">Product photo: <a href="https://www.sharkninja.com/shark-stainforce-cordless-portable-spot-spill-cleaner/HX101.html" target="_blank" rel="noopener">SharkNinja</a>.</p>';

const ROOMS = [
  { step: 2, title: "Robot and dishwasher", lead: "Start both as soon as you arrive. The Dreame robot handles most of the vacuuming and mopping, while a hot dishwasher cycle deep-cleans the dishwasher-safe heavy items. Let them work while you clean elsewhere—saving time and scrubbing by hand.", videos: [V.robot],
    photos: [P("l_robot_base", "Robot base station. Lift the lid to reach the two water tanks.")],
    tasks: [
      ["every", "Robot: empty, fill, start", "Empty and rinse the dirty water tank. Fill the clean water tank to MAX. Pick up cables and clothes from the floor. Press Start on the robot."],
      ["every", "Dishwasher: empty, load, start", "Put the clean dishes away. Load the big items: grill grates, plancha plate, grease tray, air fryer drawers and plates, coffee drip tray. Start it."],
    ] },
  { step: 3, title: "Kitchen", lead: "Nothing left on the worktops, sink or draining board.", videos: [V.coffee, V.coffeeClean, V.knives, V.fryer],
    photos: [P("kitchen-overview", "The kitchen."), P("kitchen-dishwasher-dirty", "<b>Not acceptable:</b> food left in the bottom of the dishwasher.", 1), P("kitchen-fridge", "Fridge shelves."), P("kitchen-fridge-door", "Fridge door. The black water jug lives here."), P("kitchen-freezer", "Freezer drawers and ice trays."), P("kitchen-coffee", "Coffee machine and knife block."), DONE("clean coffee machine"), P("kitchen-knives", "Knife block with the sharpener built in."), P("kitchen-airfryer", "Ninja air fryer."), DONE("clean air fryer"), P("kitchen-hob", "Hob and oven."), P("kitchen-extractor", "Extractor hood above the hob."), P("kitchen-sink", "Sink and filtered water tap."), P("kitchen-bin", "Kitchen bin.")],
    tasks: [
      ["every", "Washing up", "Wash anything that did not go in the dishwasher. Put everything away in its cupboard."],
      ["every", "Fridge: check and wipe", "Throw away anything old, mouldy or smelly (not sure? photo it and ask Michael). Wipe every shelf, drawer, door shelf and the handles."],
      ["every", "Water jug and ice trays", "Fill the black water jug and all the ice trays from the filtered water tap."],
      ["every", "Coffee machine", "Empty and refill the water tank. Rinse the drip tray, portafilter and basket. Wipe the group head. Purge and wipe the steam wand. Wash the milk jug. Wipe the outside. If the screen says Clean, Descale or Filter, tell Michael."],
      ["every", "Air fryer", "Unplug it and let it cool. Wipe both chambers and the heating elements (turn it upside down). Wipe the outside. Refit the drawers when the dishwasher is done. The main unit never goes in water."],
      ["every", "Hob and extractor", "Wipe the hob and the front of the extractor until there is no grease."],
      ["every", "Sink and worktops", "Scrub the sink and plughole, polish the tap dry. Clean every worktop, then wipe over with peppermint oil."],
      ["every", "Bin", "Take the bag out. Wipe the bin inside and out, spray with disinfectant, fit a new bag."],
      ["every", "Fresh tea towels and sponge", "Put out clean tea towels and a clean sponge. The used ones go in the wash."],
      ["mon", "Coffee cleaning cycle", "Run the cleaning cycle with one tablet. Clean the steam wand tip. Brush out the grinder chute. No water on the grinder."],
      ["mon", "Sharpen the knives", "Sharpen every straight knife in the block sharpener. Skip serrated knives. Hand-wash and dry them. Knives never go in the dishwasher."],
      ["mon", "Behind the oven", "Pull the oven forward carefully (mind the cable and gas hose). Vacuum and wipe behind and under it. Look for insects. Push it back flush."],
      ["mon", "Under the cupboards", "Take off the panels at the bottom of the cupboards, vacuum underneath, put them back."],
      ["mon", "Kitchen drain", "Half a cup of bicarbonate of soda, then a cup of white vinegar. Wait 10 minutes. Pour in a kettle of boiling water."],
      ["mon", "Bin deep clean", "Wash it out with hot soapy water. Put a spoonful of bicarbonate of soda in the bottom."],
      ["monthly", "Dishwasher and extractor filters", "Take out and rinse the dishwasher filter. Top up salt and rinse aid if the light is on. Put the extractor grease filters through the dishwasher."],
    ] },
  { step: 3, title: "Bathrooms", lead: "Two to do: the main bathroom and the guest toilet by the front door.",
    photos: [P("r_shower", "Main bathroom shower."), P("r_shower_floor", "<b>Not acceptable:</b> dark grime in the floor grout and along the glass edge.", 1), DONE("clean shower floor"), P("r_toilet", "Main bathroom toilet."), P("r_sink", "Main bathroom sink and mirror."), P("r_towels", "Clean towels live on this shelf. Fold and stack them neatly."), P("l_guest_wc", "Guest toilet by the front door.")],
    warn: ["Never mix cleaning products. Bleach mixed with vinegar or toilet cleaner makes a toxic gas. Rinse the bleach away completely before using anything else."],
    tasks: [
      ["every", "Mirrors and shower glass", "Polish streak-free, inside and out."],
      ["every", "Shower", "Scrub the floor and grout with diluted bleach, then rinse it all away. Wipe the walls and taps, polish the chrome, pull hair out of the drain."],
      ["every", "Both toilets", "Scrub the bowl and under the rim. Disinfect the seat on both sides, the lid, the flush button and the base. Rinse the brush."],
      ["every", "Sinks and surfaces", "Clean the sinks and taps. Wipe every surface, door handle and light switch."],
      ["every", "Towels, toilet roll, soap, bins", "Fresh towels out, used ones in the wash. Top up toilet roll and soap. Empty the bins."],
      ["every", "Floors", "Vacuum and mop, including behind the toilets."],
      ["mon", "Drains, mat, fan, grout", "Freshen the drains (bicarbonate, vinegar, boiling water). Wash the bath mat. Dust the extractor fan. Look for black mould in the grout and tell Michael."],
      ["monthly", "Descale", "Descale the shower head and taps."],
    ] },
  { step: 3, title: "Bedroom", lead: "Bed made, every piece of clothing put away, every surface dust-free.", videos: [V.sleep],
    photos: [P("r_bed_unmade", "<b>Not acceptable:</b> bed left unmade.", 1), DONE("bed made"), P("r_clothes_out", "<b>Not acceptable:</b> clothes left on top of the drawers.", 1), P("r_drawers_clutter", "<b>Not acceptable:</b> a cluttered top. Line things up and coil the cables.", 1), P("r_wardrobe", "Wardrobe: hang everything neatly, facing the same way."), P("r_bedside", "Bedside table."), P("r_mirror", "Bedroom mirror."), P("r_hubs", "The two black boxes are the Eight Sleep hubs. Dust them, nothing on top."), P("r_pillow_hose", "The black Eight Sleep pillow cover and its hose. Never pull the hose.")],
    warn: ["Never wash or dry-clean the Eight Sleep mattress cover or pillow covers. Only the normal sheets and pillowcases come off."],
    tasks: [
      ["every", "Mirror", "Polish streak-free."],
      ["every", "Clothes away", "Nothing on the drawers, chairs, bed or floor. Fold into drawers or hang in the wardrobe."],
      ["every", "Make the bed", "Sheets tight, duvet straight, pillows lined up."],
      ["every", "Bedside tables and lamps", "Dust them and tidy everything on them."],
      ["every", "Eight Sleep hubs", "Dust the two black hubs. Keep their vents clear. Check no hose is bent or squashed."],
      ["mon", "Change the bedding", "Strip the sheets, duvet cover and pillowcases and bag them for the dry cleaner. Make the bed with a fresh set. Put the returned set in the linen cupboard."],
      ["mon", "Pillows cooling side up", "Leave the Eight Sleep covers on. Put the fresh pillowcases on with the cooling side facing up."],
      ["mon", "Under the bed", "Vacuum under the bed with the Dyson where the robot cannot reach."],
      ["monthly", "Lampshades", "Dust the lampshades and light fittings."],
    ] },
  { step: 3, title: "Living room", lead: "Sofa tidy, blankets folded away, screens dust-free, projector not moved.",
    photos: [{ ...P("shark-stainforce", STAINFORCE_GUIDE), alt: "Shark StainForce HX101 cordless spot cleaner and spray bottle in their carry caddy." }, P("l_sofa", "<b>Not acceptable:</b> blankets left out on the sofa.", 1), DONE("tidy sofa"), P("l_screen", "The projector screen."), P("l_projector", "The projector on the TV cabinet. Do not move it."), P("l_proj_lens", "The lens is the black glass strip on top. Dry cloth only.")],
    warn: ["Do not move the projector. Even a small push moves the picture. If it moves, put it back on its markers, switch it on and check the picture fits the screen."],
    tasks: [
      ["every", "Sofa", "Plump and straighten every cushion. Fold the blankets neatly and put them away. Check for stains; use the Shark StainForce on suitable fabric if needed. Open the guide first, then clean the tool after use."],
      ["every", "TV and projector", "Wipe the TV screen with a dry microfibre cloth. With the projector off and cool, dust it and polish the black lens strip on top. No sprays."],
      ["mon", "Vacuum the sofa", "Vacuum the sofa, including under the cushions."],
    ] },
  { step: 3, title: "Balcony", lead: "Grill spotless, furniture free of marks, fountain flowing, ice bath clear.", videos: [V.grillBrush],
    // Owner-supplied photos, added 31 October 2026. Keep existing task positions for saved ticks.
    photos: [{ ...P("b_grill_brush", GRILL_BRUSH_GUIDE), alt: "The Green Lion GL-CB5 electric grill brush box, showing the brush, water tank, gloves and scraper." }, P("b_grill_brush_box", "The back of your box: model GL-CB5, with the storage case and detachable water tank shown."), P("b_gas", "Gas cylinder under the table. Turn the valve off first."), P("b_grill_burner", "<b>Not acceptable:</b> burnt grease in the burner channel.", 1), P("b_grease_tray", "<b>Not acceptable:</b> grease left in the drip tray.", 1), DONE("clean burner and drip tray"), P("b_grill_lid", "Finished: lids closed, tabletop wiped with warm water."), P("b_table_chairs", "Dining chairs."), P("b_loungers", "Sun loungers."), P("b_sauna_seaview", "Inside the sauna: benches, glass and the stone heater."), P("b_sauna_heater", "Sauna benches."), P("b_sauna_bucket", "The sauna bucket and ladle. Fill it to the top with filtered water."),P("b_fountain", "The fountain."), P("b_fountain_dirty", "<b>Not acceptable:</b> green and yellow grime on the tiers.", 1), DONE("clean white fountain"), P("b_ice_closed", "Ice bath with its cover on."), P("b_ice_net", "The fishing net is kept beside the ice bath."), P("b_ice_debris", "<b>Not acceptable:</b> debris in the ice bath water.", 1), P("b_ice_skim", "Skim it all out with the net."), P("b_balustrade", "Balcony glass and handrail.")],
    warn: ["Grill tabletop: warm water only. No polish, sprays or chemicals on it.", "No chemicals in the fountain (birds drink from it). No bleach or sprays on the sauna wood.", "Only clean glass you can reach standing flat on the balcony floor. Never lean over the glass or climb on furniture."],
    tasks: [
      ["every", "Grill: gas off", "Gas off at the cylinder under the table. Grill completely cool."],
      ["every", "Grill: clean and polish", "Use the Green Lion brush on suitable grill grates (see Photo guide). Clean the burner channels by hand. Empty and wash the drip tray. Refit the clean parts from the dishwasher. Polish exterior steel only."],
      ["every", "Grill tabletop", "Wipe with warm water only (a drop of mild soap if needed) and dry it."],
      ["every", "Chairs and sun loungers", "Wipe them down. Remove every mark before it stains."],
      ["every", "Sauna", "Check it is off and cool. Polish the glass inside and out. Wipe the benches and walls with the eucalyptus sauna wash in warm water. Sweep the floor. Leave the door open to air."],
      ["every", "Sauna bucket", "Fill the black sauna bucket right to the top with water from the filtered water tap in the kitchen. Put it back on the bench with the ladle inside."],
      ["every", "Fountain", "Unplug the pump. Take out leaves and dirt. Scrub every tier until white. Rinse the pump intake. Fill to the top, plug in, check the water flows strongly over every level."],
      ["every", "Ice bath", "Skim out every bit of debris with the net. Wipe the rim and lid. Tell Michael if water is pooling underneath."],
      ["every", "Bird feeder and grass", "Top up the feeder with a small amount of food from the utility cupboard. Vacuum the grass with the Dyson, especially round the feeder. Empty the Dyson bin after."],
      ["every", "Balcony floor", "Sweep and mop the tiled areas."],
      ["thu", "Balcony glass", "Clean the balcony doors, windows and glass panels on both sides, streak-free. Wipe the handrail."],
      ["monthly", "Sauna deep clean", "Dust the heater guard, light and vents. Look for sweat marks or mould on the wood and tell Michael. Replace the eucalyptus bundle."],
      ["fortnightly", "Fountain: replace all the water", "Unplug the pump. Empty all the old water, rinse the basin and refill with fresh water—not just a top-up. No chemicals: birds drink from the fountain. Only plug the pump back in once refilled, then check water flows over every level. A full change every two weeks helps prevent stagnant water."],
    ] },
  { step: 3, title: "Around the apartment", lead: "Entrance clean, everything dusted, plants watered, all 4 diffusers running.",
    photos: [P("l_entrance", "Entrance: shoe rack and the inside mat."), P("l_mat_out", "The outside mat by the front door."), P("l_mirror", "Hallway mirror."), P("l_floor_plant", "Floor plants on the tiles."), P("diffuser-kitchen-tower", "Kitchen diffuser (black tower), next to the air purifier."), P("diffuser-aroma-box", "Diffuser (black box)."), P("diffuser-bathroom", "Bathroom diffuser and its blue oil refill."), P("diffuser-silver-tower", "Diffuser (silver tower).")],
    tasks: [
      ["every", "Entrance", "Vacuum both mats (inside and outside the front door). Wipe the door, handle and frame. Polish the hallway mirror."],
      ["every", "Dust everything", "All surfaces, shelves, skirting boards, door handles and light switches. Top to bottom."],
      ["every", "Plants", "Push a finger 3 cm into the soil. Water only if it is dry. Scrape off any white mould. Empty saucers and wipe up spills."],
      ["every", "Aroma diffusers (4)", "Kitchen, living room, bathroom, bedroom. Top up oil, change batteries if needed, make sure all 4 are on."],
      ["every", "Floors touch-up", "After the robot, use the Dyson on edges, corners and under furniture. Quick spot-mop. Check carpets and rugs for stains; use the Shark StainForce on suitable fabric if needed. Open the guide first, then clean the tool after use."],
      ["every", "Rubbish", "Empty every bin in the apartment and take all the bags out."],
      ["mon", "Under the floor plants", "Lift each plant standing on the tiles. Mop and dry underneath. Wipe the saucer and put the plant back on it. Tell Michael about any water marks."],
      ["thu", "Windows", "Clean all bedroom and living room windows on both sides, streak-free, plus frames, tracks and sills."],
      ["monthly", "AC vents", "Dust all the air-conditioning vents and grilles."],
    ] },
  { step: 3, title: "Laundry", lead: "Washed, dried, ironed and put away before you leave.",
    tasks: [
      ["every", "Wash and dry", "From the laundry basket, take items safe to wash and tumble dry (underwear, socks, towels). Add the used cleaning cloths and tea towels. One detergent pod plus scent booster. Quick wash with drying. Leave delicate items in the basket."],
      ["every", "Iron, fold, put away", "Iron what needs it and hang it in the wardrobe. Fold everything else neatly into the right drawers. Bedding and towels go in the linen cupboard."],
      ["monthly", "Washing machine clean", "Wipe the door seal and the soap drawer. Run an empty hot drum-clean cycle."],
    ] },
  { step: 4, title: "Machines and last walk round", lead: "After all the vacuuming is finished.", videos: [V.dyson, V.robot],
    photos: [P("dyson-v12-and-washer", "Dyson vacuum on its wall dock."), P("coway-airmega", "The grey Coway Airmega beside the living-room cabinet, to the left of the tall light panel.")],
    tasks: [
      ["mon", "Dyson vacuum", "Empty and wipe the bin. Rinse the filter in cold water and leave it out to dry (24 hours). Pull hair off the brush (no water on it). Rinse the soft roller. Check for blockages."],
      ["mon", "Robot vacuum", "Cut hair off the main brush and side brush. Tap the filter clean (do not wash it). Rinse the mop pads. Wipe the sensors and wheels. If the dust bag is full, tell Michael."],
      ["mon", "Air purifiers", "Dust and wipe the outside of the Dyson purifiers. On the Coway, vacuum or rinse the grey mesh pre-filter and let it dry. Never wash the inside filters."],
      ["every", "Robot finished", "Robot back on its base. Empty the dirty water tank again. Wipe the tray at the bottom of the base."],
      ["every", "Dishwasher empty", "Everything put away. Nothing on the worktops."],
      ["every", "Laundry away", "Nothing left in the machine or on any surface."],
      ["every", "Gas off, diffusers on", "Grill gas off at the cylinder. All 4 diffusers full and running."],
      ["every", "Final walk round", "Every room: nothing left out on any surface, bed or floor."],
    ] },
];

const ALL_PHOTOS = {};
ROOMS.forEach((r) => (r.photos || []).forEach((p) => { if (p.src) ALL_PHOTOS[p.src.slice(4, -4)] = p; }));

// Photos and videos behind each task's buttons (by task title)
const MEDIA = {
  "Robot: empty, fill, start": { p: ["l_robot_base"], v: ["robot"] },
  "Dishwasher: empty, load, start": { p: ["kitchen-dishwasher-dirty"] },
  "Fridge: check and wipe": { p: ["kitchen-fridge", "kitchen-fridge-door"] },
  "Water jug and ice trays": { p: ["kitchen-fridge-door", "kitchen-freezer", "kitchen-sink"] },
  "Coffee machine": { p: ["kitchen-coffee", "done:coffee machine"], v: ["coffee"] },
  "Coffee cleaning cycle": { p: ["kitchen-coffee"], v: ["coffeeClean"] },
  "Sharpen the knives": { p: ["kitchen-knives"], v: ["knives"] },
  "Air fryer": { p: ["kitchen-airfryer", "done:air fryer"], v: ["fryer"] },
  "Hob and extractor": { p: ["kitchen-hob", "kitchen-extractor"] },
  "Behind the oven": { p: ["kitchen-hob"] },
  "Sink and worktops": { p: ["kitchen-sink", "kitchen-overview"] },
  "Bin": { p: ["kitchen-bin"] },
  "Bin deep clean": { p: ["kitchen-bin"] },
  "Mirrors and shower glass": { p: ["r_shower", "r_sink"] },
  "Shower": { p: ["r_shower", "r_shower_floor", "done:shower floor"] },
  "Both toilets": { p: ["r_toilet", "l_guest_wc"] },
  "Sinks and surfaces": { p: ["r_sink"] },
  "Towels, toilet roll, soap, bins": { p: ["r_towels"] },
  "Mirror": { p: ["r_mirror"] },
  "Clothes away": { p: ["r_clothes_out", "r_wardrobe"] },
  "Make the bed": { p: ["r_bed_unmade", "done:bed made"] },
  "Bedside tables and lamps": { p: ["r_bedside", "r_drawers_clutter"] },
  "Eight Sleep hubs": { p: ["r_hubs"], v: ["sleep"] },
  "Change the bedding": { p: ["r_bed_unmade", "done:bed made"], v: ["sleep"] },
  "Pillows cooling side up": { p: ["r_pillow_hose"], v: ["sleep"] },
  "Sofa": { p: ["shark-stainforce", "l_sofa", "done:tidy sofa"], v: ["stainforceUse", "stainforceCare"], tool: { photo: "shark-stainforce", name: "Shark StainForce HX101" } },
  "TV and projector": { p: ["l_screen", "l_projector", "l_proj_lens"] },
  "Grill: gas off": { p: ["b_gas"] },
  "Grill: clean and polish": { p: ["b_grill_brush", "b_grill_brush_box", "b_grill_burner", "b_grease_tray", "done:burner and drip tray"], v: ["grillBrush"], note: "The video demonstrates a similar Grillion brush. For our Green Lion: grill cold, plain water in the tank, and hand-rinse the brush. Follow Photo guide for setup." },
  "Grill tabletop": { p: ["b_grill_lid"] },
  "Chairs and sun loungers": { p: ["b_table_chairs", "b_loungers"] },
  "Sauna": { p: ["b_sauna_seaview", "b_sauna_heater"] },
  "Sauna deep clean": { p: ["b_sauna_seaview"] },
  "Sauna bucket": { p: ["b_sauna_bucket", "kitchen-sink"] },
  "Fountain": { p: ["b_fountain", "b_fountain_dirty", "done:white fountain"] },
  "Fountain: replace all the water": { p: ["b_fountain", "b_fountain_dirty"] },
  "Ice bath": { p: ["b_ice_closed", "b_ice_net", "b_ice_debris", "b_ice_skim"] },
  "Balcony glass": { p: ["b_balustrade"] },
  "Entrance": { p: ["l_entrance", "l_mat_out", "l_mirror"] },
  "Floors touch-up": { p: ["shark-stainforce"], v: ["stainforceUse", "stainforceCare"], tool: { photo: "shark-stainforce", name: "Shark StainForce HX101" } },
  "Plants": { p: ["l_floor_plant"] },
  "Under the floor plants": { p: ["l_floor_plant"] },
  "Aroma diffusers (4)": { p: ["diffuser-kitchen-tower", "diffuser-aroma-box", "diffuser-bathroom", "diffuser-silver-tower"] },
  "Dyson vacuum": { p: ["dyson-v12-and-washer"], v: ["dyson"] },
  "Robot vacuum": { p: ["l_robot_base"], v: ["robot"] },
  "Robot finished": { p: ["l_robot_base"] },
  "Gas off, diffusers on": { p: ["b_gas", "diffuser-kitchen-tower"] },
  "Air purifiers": { p: ["diffuser-kitchen-tower", "r_hubs", "coway-airmega"], v: ["dysonPurifier", "cowayPre", "cowayMax", "cowaySensor"] },
  "Dishwasher empty": { p: ["kitchen-overview"] },
  "Laundry away": { p: ["r_wardrobe", "r_clothes_out"] },
  "Wash and dry": { p: ["dyson-v12-and-washer"] },
  "Washing machine clean": { p: ["dyson-v12-and-washer"] },
  "Final walk round": { p: ["r_bed_unmade", "l_sofa", "r_clothes_out"] },
};

const SUPPLIES = ["Peppermint oil", "Bicarbonate of soda", "White vinegar", "Bleach", "Toilet cleaner", "Disinfectant spray", "Glass cleaner", "Steel polish", "Eucalyptus sauna wash", "Eucalyptus bundle", "Detergent pods", "Scent booster", "Drum cleaner", "Dishwasher salt", "Rinse aid", "Coffee cleaning tablets", "Descaler", "Distilled water", "Bin bags", "Sponges", "Bird food", "Diffuser oil", "Diffuser batteries"];
