import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { bookingAPI, farmhouseAPI } from '../api/axiosInstance';
import './BookingPage.css';

// Default Demo Farmhouse
const DEMO_FARMHOUSE = {
  id: 1,
  name: 'Luxury Mountain Villa',
  location: 'Himachal Pradesh',
  pricePerDay: 3500,
  maxGuests: 8,
  bedrooms: 4,
  bathrooms: 4,
  imageUrl: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=1200&auto=format&fit=crop'
};

// Official active offers & promo codes
export const ACTIVE_OFFERS = [
  {
    code: 'POOL20',
    percent: 20,
    title: 'Pool Party Special',
    tagline: '20% OFF — Private Pool Villas',
    icon: '🏊'
  },
  {
    code: 'WEEKEND15',
    percent: 15,
    title: 'Weekend Getaway',
    tagline: '15% OFF — Weekend Stays',
    icon: '✨'
  },
  {
    code: 'NATURE10',
    percent: 10,
    title: 'Nature Lover',
    tagline: '10% OFF — Eco Retreats',
    icon: '🌿'
  }
];

// Rich Curated Add-ons Catalog
export const ADDON_LIST = [
  {
    key: 'chef',
    category: 'dining',
    badge: '💎 Luxury Choice',
    icon: '👨‍🍳',
    label: 'Private Estate Chef & Butler',
    tagline: 'Personalized 3-course organic feast prepared live in the estate kitchen',
    desc: 'Dedicated culinary master cooking breakfast, lunch, and dinner using farm-fresh organic ingredients tailored to your taste.',
    price: 1800,
    unit: 'per guest / day',
    isPerGuest: true,
    defaultQty: 2,
    rating: 4.9,
    reviewsCount: 142,
    timeSlots: ['08:30 AM (Breakfast)', '01:30 PM (Lunch)', '08:30 PM (Dinner)'],
    optionsLabel: 'Cuisine Style',
    options: ['Vegetarian Gourmet Feast', 'Royal Mughlai / Tandoori', 'Continental / Italian', 'Jain / Satvik Special'],
    inclusions: [
      'Dedicated Chef & Service Butler',
      'All Grocery & Fresh Organic Ingredients',
      'Customized 3-Course Gourmet Menu',
      'Post-Meal Kitchen Sanitization & Cleanup'
    ]
  },
  {
    key: 'bbq',
    category: 'dining',
    badge: '🔥 Most Popular',
    icon: '🍢',
    label: 'Live Lawn BBQ Grill Master',
    tagline: 'Sizzling open-air live charcoal barbecue station with marinated skewers',
    desc: 'Professional grill master sets up a private lawn BBQ with premium marinades, cottage cheese, mushrooms, chicken/paneer skewers, and artisan dips.',
    price: 1500,
    unit: 'per setup',
    isPerGuest: false,
    defaultQty: 1,
    rating: 4.8,
    reviewsCount: 188,
    timeSlots: ['06:00 PM (Sunset)', '08:00 PM (Evening)', '10:00 PM (Late Night)'],
    optionsLabel: 'Grill Preference',
    options: ['Veggie Delight Platter', 'Mixed Veg & Paneer Tikka', 'Spicy Peri-Peri Mix', 'Non-Veg Mixed Grill'],
    inclusions: [
      'Imported Charcoal Pit & Skewer Sets',
      'Grill Master for 2 Hours',
      'Assorted Dips, Chutneys & Garlic Bread',
      'Outdoor Dining Setup with Ambient Lanterns'
    ]
  },
  {
    key: 'floating_breakfast',
    category: 'dining',
    badge: '🥂 Couples Favorite',
    icon: '🥐',
    label: 'Floating Pool Breakfast Tray',
    tagline: 'Instagram-worthy floating luxury wicker tray served directly in your private pool',
    desc: 'Wake up to freshly pressed juices, warm croissants, Belgian waffles, seasonal cut fruits, and espresso served on a floating heart-shaped tray.',
    price: 1200,
    unit: 'per tray',
    isPerGuest: false,
    defaultQty: 1,
    rating: 4.9,
    reviewsCount: 96,
    timeSlots: ['08:30 AM (Morning Sun)', '09:30 AM (Brunch Time)', '10:30 AM (Late Riser)'],
    optionsLabel: 'Tray Theme',
    options: ['Classic Continental & Croissants', 'Fresh Fruit & Pancake Medley', 'Indian Masala Omelette & Parathas'],
    inclusions: [
      'Floating Handcrafted Heart Wicker Basket',
      'Fresh Cold-Pressed Juices & Coffee',
      'Waffles, Croissants & Exotic Berries',
      'Flower Petal Pool Decoration'
    ]
  },
  {
    key: 'farm_basket',
    category: 'dining',
    badge: '🌿 Eco Friendly',
    icon: '🧺',
    label: 'Organic Farm-to-Table Basket',
    tagline: 'Crate of freshly harvested organic vegetables, estate honey & artisan bread',
    desc: 'Freshly plucked organic salad greens, cherry tomatoes, herbs, pure raw estate honey, homemade sourdough, and handcrafted farm butter.',
    price: 900,
    unit: 'per basket',
    isPerGuest: false,
    defaultQty: 1,
    rating: 4.7,
    reviewsCount: 64,
    timeSlots: ['Arrival Greeting', 'Morning 08:00 AM', 'Departure Gift'],
    optionsLabel: 'Basket Type',
    options: ['Artisan Bakery & Honey', 'Fresh Salad & Vegetable Crate', 'Estate Preserves & Jams'],
    inclusions: [
      'Farm Plucked Hydroponic Greens & Herbs',
      '500g 100% Pure Raw Estate Honey Jar',
      'Fresh Baked Artisan Sourdough Loaf',
      'Eco-Friendly Wooden Souvenir Crate'
    ]
  },
  {
    key: 'dj',
    category: 'celebration',
    badge: '🎉 Party Hit',
    icon: '🎵',
    label: 'Pro DJ Sound & Party Laser Lights',
    tagline: '2000W JBL party audio system, wireless mics & dynamic laser light beams',
    desc: 'Turn your villa lawn or pool deck into a private festival with high-power Bluetooth audio, bass subwoofers, strobe lights, and party smoke effect.',
    price: 3500,
    unit: 'per 4 hours',
    isPerGuest: false,
    defaultQty: 1,
    rating: 4.9,
    reviewsCount: 210,
    timeSlots: ['05:00 PM - 09:00 PM', '07:00 PM - 11:00 PM', 'Full Evening'],
    optionsLabel: 'Audio Setup',
    options: ['Lawn Dance Floor Setup', 'Poolside Waterproof Setup', 'Indoor Living Lounge Setup'],
    inclusions: [
      '2x 1000W High Output JBL Party Speakers',
      'RGB Club Strobe Lights & Laser Beams',
      '2x Wireless Mics for Karaoke',
      'Audio Technician for Onsite Hookup'
    ]
  },
  {
    key: 'decor',
    category: 'celebration',
    badge: '✨ Aesthetic',
    icon: '🌸',
    label: 'Bespoke Celebration Decoration',
    tagline: 'Fairy light canopies, fresh floral arches, neon signage & customized banners',
    desc: 'Surprise your loved ones with breathtaking venue transformation for birthdays, anniversaries, bachelorette parties, or romantic dates.',
    price: 2000,
    unit: 'per setup',
    isPerGuest: false,
    defaultQty: 1,
    rating: 4.9,
    reviewsCount: 175,
    timeSlots: ['Setup before check-in', 'Evening 05:30 PM Setup'],
    optionsLabel: 'Celebration Occasion',
    options: ['Romantic Anniversary / Proposal', 'Birthday Celebration & Glow Sign', 'Pool Party & Tropical Theme', 'Bohemian Fairy-Light Canopy'],
    inclusions: [
      '300m Warm Fairy Light Weaving',
      'Fresh Exotic Floral Arch / Ring',
      'Customized Neon Backdrop & Helium Balloons',
      'Complimentary Greeting Card & Photo Frame'
    ]
  },
  {
    key: 'cinema',
    category: 'celebration',
    badge: '🎬 Unique Experience',
    icon: '🍿',
    label: 'Starlight Lawn Cinema & Projector',
    tagline: '150" HD outdoor projection screen, cozy plush bean bags & popcorn bar',
    desc: 'Enjoy your favorite movies under the starry night sky with full cinematic 4K projection, cozy blankets, ambient lanterns, and gourmet popcorn.',
    price: 2200,
    unit: 'per night',
    isPerGuest: false,
    defaultQty: 1,
    rating: 4.8,
    reviewsCount: 112,
    timeSlots: ['07:30 PM - 11:00 PM', '09:00 PM - 01:00 AM'],
    optionsLabel: 'Streaming Preference',
    options: ['OTT Cinema (Netflix/Prime 4K)', 'Live Sports Match Screening', 'Private Photo/Video Slideshow'],
    inclusions: [
      '150-inch Weather-Resistant HD Screen',
      '4K Smart Projector with High Lumens',
      '6x Luxury Lawn Bean Bags & Warm Throws',
      'Fresh Butter & Caramel Popcorn Tub'
    ]
  },
  {
    key: 'acoustic',
    category: 'celebration',
    badge: '🎸 Live Music',
    icon: '🎶',
    label: 'Live Acoustic Guitarist & Singer',
    tagline: '2-hour unplugged live musical performance by a professional singer',
    desc: 'Elevate your poolside evening or dinner with soulful acoustic covers, retro Bollywood melodies, and customized song dedications.',
    price: 2800,
    unit: '2-hour session',
    isPerGuest: false,
    defaultQty: 1,
    rating: 4.9,
    reviewsCount: 84,
    timeSlots: ['06:30 PM - 08:30 PM', '08:30 PM - 10:30 PM'],
    optionsLabel: 'Genre Preference',
    options: ['Romantic Retro & Bollywood Unplugged', 'English Indie & Pop Hits', 'Sufi & Ghazal Nights', 'Party Sing-Along Mix'],
    inclusions: [
      'Professional Vocalist & Acoustic Guitarist',
      'Portable Amplified Sound System',
      'Custom Song Dedication List',
      'Interactive Sing-Along Session'
    ]
  },
  {
    key: 'spa',
    category: 'wellness',
    badge: '💆 Relaxing',
    icon: '🌸',
    label: 'Couples Herbal Spa & Massage',
    tagline: '90-minute rejuvenating Ayurvedic aromatherapy massage session',
    desc: 'Experience pure bliss with trained certified wellness therapists using organic essential oils, hot stone compresses, and calming herbal tea.',
    price: 3000,
    unit: 'for 2 guests',
    isPerGuest: false,
    defaultQty: 1,
    rating: 4.9,
    reviewsCount: 156,
    timeSlots: ['11:00 AM (Midday Chill)', '04:00 PM (Afternoon Glow)', '07:00 PM (Pre-Dinner Relax)'],
    optionsLabel: 'Therapy Type',
    options: ['Deep Tissue Aromatherapy', 'Ayurvedic Herbal Potli Massage', 'Swedish Stress Relief', 'Foot Reflexology & Head Massage'],
    inclusions: [
      '2x Certified Spa Therapists',
      'Pure Cold-Pressed Essential Oils',
      'Heated Herbal Compress & Eye Masks',
      'Post-Massage Organic Chamomile Tea'
    ]
  },
  {
    key: 'yoga',
    category: 'wellness',
    badge: '🧘 Mindfulness',
    icon: '🌅',
    label: 'Sunrise Lawn Yoga & Meditation',
    tagline: 'Private guided morning Hatha yoga, pranayama & sound bath on the estate lawn',
    desc: 'Greet the sunrise surrounded by mist and birdsong with an expert yoga instructor guiding breathing techniques, gentle stretches, and singing bowl meditation.',
    price: 1400,
    unit: 'group session',
    isPerGuest: false,
    defaultQty: 1,
    rating: 4.8,
    reviewsCount: 92,
    timeSlots: ['06:30 AM (Sunrise)', '07:30 AM (Morning)', '08:30 AM (Gentle Start)'],
    optionsLabel: 'Session Style',
    options: ['Gentle Morning Hatha & Pranayama', 'Sound Bowl Healing & Meditation', 'Power Vinyasa Flow', 'Couples Synchronized Yoga'],
    inclusions: [
      'Certified Yoga Master for 60 Minutes',
      'Premium Eco-Friendly Yoga Mats Provided',
      'Tibetan Singing Bowl Sound Therapy',
      'Detox Green Juice / Coconut Water for all'
    ]
  },
  {
    key: 'adventure',
    category: 'wellness',
    badge: '🛶 Adventure',
    icon: '🌲',
    label: 'Guided Forest & Stream Trek',
    tagline: 'Private local naturalist-led hike through hidden trails, pine groves & streams',
    desc: 'Explore scenic ridge viewpoints, native wildlife, and tranquil fresh mountain stream crossings with safety gear, hydration packs, and trail snacks.',
    price: 2200,
    unit: 'guided expedition',
    isPerGuest: false,
    defaultQty: 1,
    rating: 4.7,
    reviewsCount: 104,
    timeSlots: ['07:00 AM (Early Bird)', '04:00 PM (Sunset Vista)'],
    optionsLabel: 'Trail Difficulty',
    options: ['Easy Scenic Nature Walk (1.5 hrs)', 'Moderate Stream & Hill Trail (2.5 hrs)', 'Adventure Ridge Scramble (3.5 hrs)'],
    inclusions: [
      'Certified Wilderness & First-Aid Guide',
      'Trekking Poles & Energy Snack Packs',
      'Binoculars for Birdwatching',
      'High-Res Photos along Scenic Viewpoints'
    ]
  },
  {
    key: 'telescope',
    category: 'wellness',
    badge: '🔭 Stargazing',
    icon: '🌌',
    label: 'Deep Sky Stargazing Telescope',
    tagline: 'High-powered computerized celestial telescope with laser constellations tour',
    desc: 'Observe Saturn’s rings, Jupiter’s moons, nebulae, and constellations in the zero light pollution mountain sky guided by an astronomy enthusiast.',
    price: 1100,
    unit: 'night session',
    isPerGuest: false,
    defaultQty: 1,
    rating: 4.9,
    reviewsCount: 78,
    timeSlots: ['08:30 PM - 10:30 PM', '10:30 PM - 12:30 AM'],
    optionsLabel: 'Observation Focus',
    options: ['Planets & Moon Craters', 'Deep Sky Nebulae & Galaxies', 'Constellation Mythology Tour'],
    inclusions: [
      '8-inch Motorized Reflector Telescope',
      'Smartphone Astrophotography Eyepiece Mount',
      'Sky Map Laser Pointer Constellation Tour',
      'Warm Spiced Cocoa Thermos'
    ]
  },
  {
    key: 'bonfire',
    category: 'comfort',
    badge: '🪵 Cozy Night',
    icon: '🔥',
    label: 'Midnight Bonfire & Gourmet S’mores',
    tagline: 'Seasoned teak firewood pit, plush lawn circle & artisanal marshmallow kit',
    desc: 'Gather around a glowing, crackling bonfire pit under the night sky. Includes skewers, premium Belgian chocolates, graham crackers, and marshmallows.',
    price: 1500,
    unit: 'per bonfire pit',
    isPerGuest: false,
    defaultQty: 1,
    rating: 4.8,
    reviewsCount: 230,
    timeSlots: ['07:30 PM Light-up', '09:00 PM Light-up', '10:30 PM Light-up'],
    optionsLabel: 'Setup Location',
    options: ['Central Lawn Firepit', 'Poolside Deck Pit', 'Hilltop Gazebo Pit'],
    inclusions: [
      '20kg Dry Hardwood Logs & Firetender Care',
      'Gourmet S’mores Kit (Chocolates & Biscuits)',
      'Roasting Skewers & Safety Enclosure',
      'Outdoor Bluetooth Speaker Access'
    ]
  },
  {
    key: 'drone',
    category: 'comfort',
    badge: '📸 Viral Reels',
    icon: '🚁',
    label: 'Drone 4K Reel & Photo Shoot',
    tagline: 'Cinematic aerial drone footage + 15 edited ready-to-post Instagram reels',
    desc: 'Capture breathtaking cinematic memories of your farmhouse stay, pool party, or romantic getaway shot by an experienced drone pilot and mobile videographer.',
    price: 2500,
    unit: 'per package',
    isPerGuest: false,
    defaultQty: 1,
    rating: 4.9,
    reviewsCount: 119,
    timeSlots: ['11:00 AM (Pool Sun)', '05:00 PM (Golden Hour Sunset)'],
    optionsLabel: 'Video Style',
    options: ['Trendy Instagram Reels & TikToks', 'Cinematic Drone Landscape Film', 'Couple Romance Music Video'],
    inclusions: [
      'DJI Mini Pro 4K Drone Aerial Shoots',
      '30-45 Minute Dedicated Pilot Time',
      '15 Professionally Color-Graded Reels',
      'Same-Day Cloud Drive Delivery'
    ]
  },
  {
    key: 'pet_care',
    category: 'comfort',
    badge: '🐾 Pet Haven',
    icon: '🐶',
    label: 'Pet Sanctuary Kit & Daycare',
    tagline: 'Orthopedic pet bed, gourmet pet treats, splash pool & pet-sitter support',
    desc: 'Pamper your furry family members with organic treats, chew toys, outdoor fetch area, and a dedicated estate caretaker to watch over them while you relax.',
    price: 800,
    unit: 'per pet / stay',
    isPerGuest: false,
    defaultQty: 1,
    rating: 4.8,
    reviewsCount: 65,
    timeSlots: ['Full Stay Accompaniment'],
    optionsLabel: 'Pet Type',
    options: ['Small/Medium Dog', 'Large Dog Breed', 'Cat / Feline Friend'],
    inclusions: [
      'Fluffy Orthopedic Pet Bed & Clean Blankets',
      '2x Bowls + Organic Grain-Free Treats',
      'Pet Splash Tub & Tennis Ball Launcher',
      'On-Demand 2-Hour Pet Sitting Support'
    ]
  },
  {
    key: 'chauffeur',
    category: 'comfort',
    badge: '🚗 VIP Travel',
    icon: '🚘',
    label: 'VIP Luxury Chauffeur Transfer',
    tagline: 'Private AC premium sedan or SUV pick-up / drop from city airport or station',
    desc: 'Stress-free executive travel to and from the villa with professional uniformed chauffeur, bottled water, sanitizers, and luggage assistance.',
    price: 2400,
    unit: 'one-way trip',
    isPerGuest: false,
    defaultQty: 1,
    rating: 4.9,
    reviewsCount: 88,
    timeSlots: ['Check-in Pick-up', 'Check-out Return Drop', 'Both Ways (+₹2,400)'],
    optionsLabel: 'Vehicle Preference',
    options: ['Premium Sedan (Innova / City)', 'Luxury 7-Seater SUV', 'Executive Luxury Sedan'],
    inclusions: [
      'Uniformed Professional Driver',
      'Toll & Parking Charges Included',
      'Chilled Bottled Water & Wet Wipes',
      'Doorstep Luggage Care'
    ]
  }
];

const CATEGORY_TABS = [
  { key: 'all', label: '🌟 All Experiences' },
  { key: 'dining', label: '👨‍🍳 Culinary & BBQ' },
  { key: 'celebration', label: '🎉 Music & Parties' },
  { key: 'wellness', label: '💆 Spa & Adventure' },
  { key: 'comfort', label: '✨ Comfort & VIP Perks' },
];

const QUICK_TAGS = [
  '🍾 Anniversary Surprise Setup',
  '🎂 Birthday Cake & Balloons',
  '🌱 100% Pure Jain Food Only',
  '👶 Baby Cot & Highchair Needed',
  '🐶 2 Friendly Dogs Coming Along',
  '🔥 Extra Firewood Logs for Late Night',
  '🎸 Acoustic Guitar Rental'
];

const PAYMENT_METHODS = [
  { key: 'CARD', icon: '💳', label: 'Credit / Debit Card', desc: 'Visa, Mastercard, RuPay' },
  { key: 'UPI', icon: '📱', label: 'UPI Instant Pay', desc: 'Google Pay, PhonePe, Paytm' },
  { key: 'NET_BANKING', icon: '🏦', label: 'Net Banking', desc: '50+ Indian Banks' },
  { key: 'WALLET', icon: '👝', label: 'Digital Wallets', desc: 'Paytm, Amazon Pay' },
];

export const SLOT_OPTIONS = [
  { 
    key: 'AM', 
    label: '☀️ Day Only', 
    time: '09:00 AM - 05:00 PM', 
    tag: 'Day Picnic / Workcation',
    multiplier: 0.60
  },
  { 
    key: 'PM', 
    label: '🌙 Night Only', 
    time: '06:00 PM - 09:00 AM', 
    tag: 'Overnight Stay',
    multiplier: 0.75
  },
  { 
    key: 'FULL_DAY', 
    label: '🌟 All Day (Full 24h)', 
    time: '09:00 AM - 09:00 AM (Next Day)', 
    tag: 'Complete 24-Hour Stay',
    multiplier: 1.00
  },
];

const COUPLE_ALLOCATIONS = [
  { count: 1, label: '1 Couple', sub: '1 Suite • 2 Guests', guests: 2 },
  { count: 2, label: '2 Couples', sub: '2 Suites • 4 Guests', guests: 4 },
  { count: 3, label: '3 Couples', sub: '3 Suites • 6 Guests', guests: 6 },
];

function toDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function BookingPage() {
  const { farmhouseId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [farmhouse, setFarmhouse] = useState(DEMO_FARMHOUSE);
  const [currentStep, setCurrentStep] = useState(1);
  const [bookingDone, setBookingDone] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [selectedSlot, setSelectedSlot] = useState('FULL_DAY');
  const [startDate, setStartDate] = useState(toDateKey(today));
  const [endDate, setEndDate] = useState(toDateKey(tomorrow));
  const [guestCount, setGuestCount] = useState('4 Guests');
  const [specialRequests, setSpecialRequests] = useState('');

  // Calendar & Allocations
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [selectedCoupleCount, setSelectedCoupleCount] = useState(2);
  const [calendarError, setCalendarError] = useState('');

  // Booked slots map
  const [bookedSlots, setBookedSlots] = useState(() => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    const formatD = (y, m, d) => {
      const mm = String(m + 1).padStart(2, '0');
      const dd = String(d).padStart(2, '0');
      return `${y}-${mm}-${dd}`;
    };

    const map = {};
    [3, 12, 19, 27].forEach(d => {
      map[formatD(currentYear, currentMonth, d)] = { day: true, night: true };
    });
    [4, 15, 23].forEach(d => {
      map[formatD(currentYear, currentMonth, d)] = { day: true, night: false };
    });
    [8, 18, 25].forEach(d => {
      map[formatD(currentYear, currentMonth, d)] = { day: false, night: true };
    });
    return map;
  });

  // Step 2 Add-ons Configuration State
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [addonSearch, setAddonSearch] = useState('');
  const [selectedAddons, setSelectedAddons] = useState({});
  const [addonConfigurations, setAddonConfigurations] = useState(() => {
    const init = {};
    ADDON_LIST.forEach(item => {
      init[item.key] = {
        qty: item.defaultQty || 1,
        timeSlot: item.timeSlots ? item.timeSlots[0] : '',
        option: item.options ? item.options[0] : '',
        customNote: ''
      };
    });
    return init;
  });

  // Modal Detail Preview
  const [previewModalAddon, setPreviewModalAddon] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState('CARD');

  // Promo Code State
  const initialCode = searchParams.get('code') || 'POOL20';
  const [inputCouponCode, setInputCouponCode] = useState(initialCode);
  const [appliedOffer, setAppliedOffer] = useState(() => {
    return ACTIVE_OFFERS.find(o => o.code.toUpperCase() === initialCode.toUpperCase()) || ACTIVE_OFFERS[0];
  });
  const [isOfferActive, setIsOfferActive] = useState(true);

  useEffect(() => {
    fetchFarmhouseDetails();
    fetchBookedDates(farmhouseId || '1');
  }, [farmhouseId]);

  useEffect(() => {
    const codeParam = searchParams.get('code');
    if (codeParam) {
      const match = ACTIVE_OFFERS.find(o => o.code.toUpperCase() === codeParam.toUpperCase());
      if (match) {
        setInputCouponCode(match.code);
        setAppliedOffer(match);
        setIsOfferActive(true);
      }
    }
  }, [searchParams]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const fetchFarmhouseDetails = async () => {
    try {
      const id = farmhouseId || '1';
      const response = await farmhouseAPI.getFarmHouseById(id);
      if (response.data?.success && response.data.farmhouse) {
        setFarmhouse(response.data.farmhouse);
      }
    } catch (err) {
      setFarmhouse(DEMO_FARMHOUSE);
    }
  };

  const fetchBookedDates = async (id) => {
    try {
      const response = await bookingAPI.getFarmHouseBookings(id);
      if (response.data?.success && Array.isArray(response.data.bookings)) {
        setBookedSlots(prev => {
          const nextMap = { ...prev };
          response.data.bookings.forEach(b => {
            if (b.status !== 'CANCELLED' && b.startDate && b.endDate) {
              let curr = new Date(b.startDate);
              const last = new Date(b.endDate);
              const slot = (b.timeSlot || 'FULL_DAY').toUpperCase();
              while (curr <= last) {
                const k = toDateKey(curr);
                const currentData = nextMap[k] || { day: false, night: false };
                if (slot === 'AM' || slot === 'DAY') {
                  currentData.day = true;
                } else if (slot === 'PM' || slot === 'NIGHT') {
                  currentData.night = true;
                } else {
                  currentData.day = true;
                  currentData.night = true;
                }
                nextMap[k] = currentData;
                curr.setDate(curr.getDate() + 1);
              }
            }
          });
          return nextMap;
        });
      }
    } catch (err) {
      // Retain sample slots
    }
  };

  const getSlotData = (dateKey) => {
    return bookedSlots[dateKey] || { day: false, night: false };
  };

  const isSlotAvailable = (dateKey, slot) => {
    const data = getSlotData(dateKey);
    if (slot === 'AM') return !data.day;
    if (slot === 'PM') return !data.night;
    if (slot === 'FULL_DAY') return !data.day && !data.night;
    return true;
  };

  // ══════════════════════════════════════════════════════
  // PRICING CALCULATIONS & ACCURATE SLOT MULTIPLIERS
  // ══════════════════════════════════════════════════════
  const calculateNights = () => {
    if (!startDate || !endDate) return 1;
    const s = new Date(startDate);
    const e = new Date(endDate);
    const diff = Math.ceil((e - s) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 1;
  };

  const nights = calculateNights();
  const rawPricePerNight = farmhouse?.pricePerDay || 3500;
  
  // Calculate price based on selected slot (Day Only, Night Only, All Day)
  const currentSlotMeta = SLOT_OPTIONS.find(s => s.key === selectedSlot) || SLOT_OPTIONS[2];
  const pricePerNight = Math.round(rawPricePerNight * currentSlotMeta.multiplier);
  const basePrice = pricePerNight * (selectedSlot === 'AM' ? 1 : nights);

  // Addons total with quantity multiplier
  const addonTotal = Object.keys(selectedAddons).reduce((sum, key) => {
    if (selectedAddons[key]) {
      const item = ADDON_LIST.find(a => a.key === key);
      const config = addonConfigurations[key] || { qty: 1 };
      const qty = item?.isPerGuest ? (config.qty || selectedCoupleCount * 2) : (config.qty || 1);
      return sum + (item ? item.price * qty : 0);
    }
    return sum;
  }, 0);

  // Subtotal before discount
  const subtotal = basePrice + addonTotal;

  // Discount percentage & deduction
  const discountPercent = isOfferActive && appliedOffer ? appliedOffer.percent : 0;
  const discountAmount = Math.round(subtotal * (discountPercent / 100));

  // Net price after discount
  const discountedSubtotal = subtotal - discountAmount;

  // Taxes (10% GST on discounted amount)
  const taxes = Math.round(discountedSubtotal * 0.10);

  // Final total amount
  const grandTotal = discountedSubtotal + taxes;

  // Active Addon Count
  const selectedAddonKeys = Object.keys(selectedAddons).filter(k => selectedAddons[k]);
  const activeAddonCount = selectedAddonKeys.length;

  // Dynamic Luxury Experience Tier
  const getExperienceTier = () => {
    if (activeAddonCount >= 5) {
      return {
        level: 4,
        title: '👑 Platinum Royal Sanctuary',
        perk: '🎁 Unlocked: Dedicated 24/7 Butler & Commemorative Polaroid Album!',
        percent: 100,
        color: '#d97706'
      };
    }
    if (activeAddonCount >= 3) {
      return {
        level: 3,
        title: '🌟 Gold VIP Estate Retreat',
        perk: '🎁 Unlocked: Free 1-Hour Late Check-out & Farm Fresh Fruit Platter!',
        percent: 75,
        color: '#059669'
      };
    }
    if (activeAddonCount >= 1) {
      return {
        level: 2,
        title: '✨ Silver Upgraded Getaway',
        perk: '🎁 Unlocked: Complimentary Welcome Mocktail Pitcher on Arrival!',
        percent: 45,
        color: '#2563eb'
      };
    }
    return {
      level: 1,
      title: '🌿 Cozy Farmhouse Stay',
      perk: '💡 Add 1 luxury experience to unlock Free Welcome Drinks!',
      percent: 15,
      color: '#6b7280'
    };
  };

  const experienceTier = getExperienceTier();

  // Handlers for Addon toggling and customization
  const handleToggleAddon = (key) => {
    const isNowSelected = !selectedAddons[key];
    setSelectedAddons(prev => ({
      ...prev,
      [key]: isNowSelected
    }));

    const item = ADDON_LIST.find(a => a.key === key);
    if (isNowSelected) {
      showToast(`Added "${item?.label || key}" to your stay! ✨`);
    }
  };

  const handleUpdateAddonConfig = (key, field, value) => {
    setAddonConfigurations(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value
      }
    }));
  };

  // Promo Code Handlers
  const handleApplyPromoCode = (codeToTest) => {
    const rawCode = (codeToTest || inputCouponCode).trim().toUpperCase();
    const found = ACTIVE_OFFERS.find(o => o.code.toUpperCase() === rawCode);

    if (found) {
      setInputCouponCode(found.code);
      setAppliedOffer(found);
      setIsOfferActive(true);
      setError('');
      showToast(`Promo "${found.code}" applied! Saved ₹${discountAmount.toLocaleString()} 🎉`);
    } else {
      setError(`"${rawCode}" is not a valid coupon. Choose an active promo below.`);
      setIsOfferActive(false);
      setAppliedOffer(null);
    }
  };

  const handleRemoveOffer = () => {
    setInputCouponCode('');
    setAppliedOffer(null);
    setIsOfferActive(false);
    setError('');
  };

  // Calendar Month Navigation
  const getCalendarDays = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const arr = [];
    for (let i = 0; i < firstDay; i++) arr.push(null);
    for (let d = 1; d <= totalDays; d++) arr.push(new Date(year, month, d));
    return arr;
  };

  const handlePrevMonth = () => {
    setCalendarMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCalendarMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  // Slot click booking handler
  const handleSlotPick = (day, slot) => {
    if (!day) return;
    const key = toDateKey(day);
    const todayStr = toDateKey(new Date());
    if (key < todayStr) return;

    const slotInfo = getSlotData(key);

    if (slot === 'AM' && slotInfo.day) {
      setCalendarError(`Date ${key}: Day Slot (09:00 AM - 05:00 PM) is already booked. Please choose Night Slot or another open day.`);
      setTimeout(() => setCalendarError(''), 4000);
      return;
    }
    if (slot === 'PM' && slotInfo.night) {
      setCalendarError(`Date ${key}: Night Slot (06:00 PM - 09:00 AM) is already booked. Please choose Day Slot or another open day.`);
      setTimeout(() => setCalendarError(''), 4000);
      return;
    }
    if (slot === 'FULL_DAY' && (slotInfo.day || slotInfo.night)) {
      setCalendarError(`Date ${key}: All Day booking requires both slots open. One slot is already reserved.`);
      setTimeout(() => setCalendarError(''), 4000);
      return;
    }

    setCalendarError('');
    setSelectedSlot(slot);
    setStartDate(key);

    if (slot === 'AM') {
      // Day only stays on same date (09:00 AM - 05:00 PM)
      setEndDate(key);
      showToast(`Selected ☀️ Day Only Slot for ${formatDisplayDate(key)}!`);
    } else {
      // Night or All Day stays overnight until next morning
      const nextD = new Date(day);
      nextD.setDate(nextD.getDate() + 1);
      setEndDate(toDateKey(nextD));
      showToast(slot === 'PM' 
        ? `Selected 🌙 Night Only Slot for ${formatDisplayDate(key)}!` 
        : `Selected 🌟 All Day Slot (24h) for ${formatDisplayDate(key)}!`
      );
    }
  };

  const formatDisplayDate = (dStr) => {
    if (!dStr) return 'Select date';
    try {
      const d = new Date(dStr + 'T00:00:00');
      return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return dStr;
    }
  };

  const handleSelectCouple = (alloc) => {
    setSelectedCoupleCount(alloc.count);
    setGuestCount(`${alloc.guests} Guests`);
  };

  const handleAddQuickTag = (tag) => {
    if (!specialRequests.includes(tag)) {
      setSpecialRequests(prev => prev ? `${prev}, ${tag}` : tag);
      showToast(`Added "${tag}" to special requests! ✍️`);
    }
  };

  const handleCompleteBooking = async () => {
    setBookingLoading(true);
    setError('');

    try {
      const payload = {
        farmHouseId: farmhouse?.id || 1,
        startDate,
        endDate: endDate || startDate,
        numberOfGuests: parseInt(guestCount) || selectedCoupleCount * 2,
        specialRequirements: specialRequests,
        timeSlot: selectedSlot,
        totalPrice: grandTotal
      };

      try {
        await bookingAPI.createBooking(payload, 1);
      } catch (e) {
        // Fallback for preview
      }

      setBookingDone(true);
    } catch (err) {
      setError('Booking processing failed. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  // Filtered Addons for Category & Search
  const filteredAddons = ADDON_LIST.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = !addonSearch || 
      item.label.toLowerCase().includes(addonSearch.toLowerCase()) || 
      item.desc.toLowerCase().includes(addonSearch.toLowerCase()) ||
      item.tagline.toLowerCase().includes(addonSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="bk-page-root">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="bk-toast-banner">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── 1. Hero Banner ── */}
      <section className="bk-hero-banner">
        <div className="bk-hero-overlay"></div>
        <div className="bk-hero-inner">
          <h1>{farmhouse?.name || 'Luxury Mountain Villa'}</h1>
          <div className="bk-breadcrumb">
            <Link to="/">Home</Link>
            <span className="sep">&gt;</span>
            <Link to="/farmhouses">Farm Houses</Link>
            <span className="sep">&gt;</span>
            <span className="current">Booking Experience</span>
          </div>
        </div>
      </section>

      {/* ── 2. Stepper Progress Header ── */}
      <div className="bk-stepper-container">
        <div className="bk-stepper-bar">
          <div
            className={`bk-step-unit ${currentStep >= 1 ? 'active' : ''} ${currentStep > 1 ? 'done' : ''}`}
            onClick={() => setCurrentStep(1)}
          >
            <span className="bk-step-num">1</span>
            <span className="bk-step-text">Dates &amp; Slot</span>
          </div>

          <div className="bk-step-line"></div>

          <div
            className={`bk-step-unit ${currentStep >= 2 ? 'active' : ''} ${currentStep > 2 ? 'done' : ''}`}
            onClick={() => setCurrentStep(2)}
          >
            <span className="bk-step-num">2</span>
            <span className="bk-step-text">
              Add-ons &amp; Experiences
              {activeAddonCount > 0 && <span className="bk-step-badge">{activeAddonCount}</span>}
            </span>
          </div>

          <div className="bk-step-line"></div>

          <div
            className={`bk-step-unit ${currentStep >= 3 ? 'active' : ''}`}
            onClick={() => setCurrentStep(3)}
          >
            <span className="bk-step-num">3</span>
            <span className="bk-step-text">Payment</span>
          </div>
        </div>
      </div>

      {/* ── 3. Main Form Container ── */}
      <div className="bk-main-wrapper">
        {bookingDone ? (
          /* ══════════════════════════════════════════
             CONFIRMATION RECEIPT SCREEN
             ══════════════════════════════════════════ */
          <div className="bk-card-box bk-confirm-card">
            <div className="bk-confirm-check">✓</div>
            <h2>Reservation &amp; Experience Confirmed!</h2>
            <p className="bk-confirm-desc">
              Your luxury booking at <strong>{farmhouse?.name}</strong> has been secured with 100% confirmation guarantee.
            </p>

            <div className="bk-receipt-panel">
              <div className="bk-receipt-item">
                <span>Reference ID:</span>
                <strong>REF-EST-{Math.floor(100000 + Math.random() * 900000)}</strong>
              </div>
              <div className="bk-receipt-item">
                <span>Booked Slot:</span>
                <strong className="bk-green-text">
                  {selectedSlot === 'AM' ? '☀️ Day Only (09:00 AM - 05:00 PM)' : selectedSlot === 'PM' ? '🌙 Night Only (06:00 PM - 09:00 AM)' : '🌟 All Day Stay (09:00 AM - 09:00 AM)'}
                </strong>
              </div>
              <div className="bk-receipt-item">
                <span>Check-in:</span>
                <span>{startDate}</span>
              </div>
              <div className="bk-receipt-item">
                <span>Check-out:</span>
                <span>{endDate || startDate}</span>
              </div>
              <div className="bk-receipt-item">
                <span>Guests:</span>
                <span>{guestCount} ({selectedCoupleCount} Couples)</span>
              </div>

              {selectedAddonKeys.length > 0 && (
                <div className="bk-receipt-addons-block">
                  <div className="bk-rab-title">Selected Luxury Experiences ({selectedAddonKeys.length}):</div>
                  {selectedAddonKeys.map(key => {
                    const item = ADDON_LIST.find(a => a.key === key);
                    const cfg = addonConfigurations[key];
                    return (
                      <div key={key} className="bk-rab-item">
                        <span>{item?.icon} {item?.label} ({cfg?.option || 'Standard'})</span>
                        <strong>+ ₹ {(item?.price * (cfg?.qty || 1)).toLocaleString()}</strong>
                      </div>
                    );
                  })}
                </div>
              )}

              {isOfferActive && appliedOffer && (
                <div className="bk-receipt-item">
                  <span>Applied Promo Code:</span>
                  <strong className="bk-green-text">{appliedOffer.code} ({appliedOffer.percent}% OFF — Saved ₹ {discountAmount.toLocaleString()})</strong>
                </div>
              )}
              <div className="bk-receipt-item bk-total-highlight">
                <span>Total Paid:</span>
                <strong>₹ {grandTotal.toLocaleString()}</strong>
              </div>
            </div>

            <div className="bk-confirm-buttons">
              <Link to="/my-bookings" className="bk-btn-primary">View My Bookings</Link>
              <Link to="/" className="bk-btn-secondary">Return to Home</Link>
            </div>
          </div>
        ) : (
          <div className="bk-form-container">
            {/* ══════════════════════════════════════════
                STEP 1: DATES & GUESTS WITH DIRECT SLOT BOOKING
                ══════════════════════════════════════════ */}
            {currentStep === 1 && (
              <div className="bk-card-box">
                {/* ── Direct Slot Option Switcher Header ── */}
                <div className="bk-slot-selector-top">
                  <div className="bk-sst-head">
                    <span className="bk-sst-badge">⚡ Choose Your Slot Type</span>
                    <h3>Select Day, Night, or All Day to Book Instantly</h3>
                    <p>Click any slot below or click directly on the date cards in the calendar.</p>
                  </div>

                  <div className="bk-slot-pills-trio">
                    {SLOT_OPTIONS.map(slot => (
                      <div
                        key={slot.key}
                        className={`bk-slot-trio-card ${selectedSlot === slot.key ? 'active' : ''}`}
                        onClick={() => setSelectedSlot(slot.key)}
                      >
                        <div className="bk-stc-top">
                          <span className="bk-stc-label">{slot.label}</span>
                          <span className="bk-stc-tag">{slot.tag}</span>
                        </div>
                        <span className="bk-stc-time">{slot.time}</span>
                        <div className="bk-stc-rate">
                          <strong>₹ {Math.round((farmhouse?.pricePerDay || 3500) * slot.multiplier).toLocaleString()}</strong>
                          <small>{slot.key === 'AM' ? '/ day slot' : slot.key === 'PM' ? '/ night slot' : '/ 24h stay'}</small>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ── Interactive Calendar & Standard Allocations ── */}
                <div className="bk-calendar-manifest-card">
                  {/* Left Column: Calendar */}
                  <div className="bk-cal-pane">
                    {/* Calendar Month Navigation Header */}
                    <div className="bk-cal-nav-bar">
                      <button 
                        type="button" 
                        className="bk-cal-nav-btn" 
                        onClick={handlePrevMonth}
                        title="Previous Month"
                      >
                        ‹
                      </button>
                      <strong className="bk-cal-month-title">
                        {calendarMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </strong>
                      <button 
                        type="button" 
                        className="bk-cal-nav-btn" 
                        onClick={handleNextMonth}
                        title="Next Month"
                      >
                        ›
                      </button>
                    </div>

                    {calendarError && (
                      <div className="bk-cal-alert">
                        ⚠️ {calendarError}
                      </div>
                    )}

                    <div className="bk-cal-days-grid">
                      <div className="bk-wk">SUN</div>
                      <div className="bk-wk">MON</div>
                      <div className="bk-wk">TUE</div>
                      <div className="bk-wk">WED</div>
                      <div className="bk-wk">THU</div>
                      <div className="bk-wk">FRI</div>
                      <div className="bk-wk">SAT</div>

                      {getCalendarDays(calendarMonth).map((day, idx) => {
                        if (!day) return <div key={`empty-${idx}`} className="bk-cal-day-card bk-empty"></div>;
                        const key = toDateKey(day);
                        const todayStr = toDateKey(new Date());
                        const isPastDate = key < todayStr;
                        const isTodayDate = key === todayStr;
                        const isSelectedDate = startDate === key;
                        const slotData = getSlotData(key);
                        const isDayBooked = slotData.day;
                        const isNightBooked = slotData.night;
                        const isAllDayBooked = isDayBooked || isNightBooked;

                        return (
                          <div
                            key={key}
                            className={`bk-cal-day-card ${isPastDate ? 'disabled' : ''} ${isSelectedDate ? 'range-start' : ''}`}
                          >
                            <div className={`bk-cal-day-header ${isTodayDate ? 'today' : ''}`}>
                              <span className="bk-cal-day-num">{day.getDate()}</span>
                              {isTodayDate && <span className="bk-cal-today-badge">Today</span>}
                            </div>

                            <div className="bk-slot-buttons-trio">
                              {/* 1. Day Slot Button */}
                              <button
                                type="button"
                                className={`bk-slot-btn day ${isPastDate || isDayBooked ? 'disabled' : ''} ${isSelectedDate && selectedSlot === 'AM' ? 'selected' : ''}`}
                                disabled={isPastDate || isDayBooked}
                                title="Click to book Day Slot (09:00 AM - 05:00 PM)"
                                onClick={() => handleSlotPick(day, 'AM')}
                              >
                                ☀️ Day
                              </button>

                              {/* 2. Night Slot Button */}
                              <button
                                type="button"
                                className={`bk-slot-btn night ${isPastDate || isNightBooked ? 'disabled' : ''} ${isSelectedDate && selectedSlot === 'PM' ? 'selected' : ''}`}
                                disabled={isPastDate || isNightBooked}
                                title="Click to book Night Slot (06:00 PM - 09:00 AM)"
                                onClick={() => handleSlotPick(day, 'PM')}
                              >
                                🌙 Night
                              </button>

                              {/* 3. All Day Slot Button */}
                              <button
                                type="button"
                                className={`bk-slot-btn all-day ${isPastDate || isAllDayBooked ? 'disabled' : ''} ${isSelectedDate && selectedSlot === 'FULL_DAY' ? 'selected' : ''}`}
                                disabled={isPastDate || isAllDayBooked}
                                title="Click to book All Day 24h Stay (09:00 AM - 09:00 AM)"
                                onClick={() => handleSlotPick(day, 'FULL_DAY')}
                              >
                                🌟 All Day
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="bk-cal-clean-legend">
                      <span className="bk-legend-entry">
                        <span className="bk-legend-swatch available"></span> Open (Green)
                      </span>
                      <span className="bk-legend-entry">
                        <span className="bk-legend-swatch selected"></span> Selected Slot
                      </span>
                      <span className="bk-legend-entry">
                        <span className="bk-legend-swatch booked"></span> Booked (Red)
                      </span>
                    </div>

                    <div className="bk-cal-stay-box">
                      <div className="bk-csb-col">
                        <span className="bk-csb-label">CHECK-IN</span>
                        <strong className="bk-csb-date">{startDate ? formatDisplayDate(startDate) : 'Select date'}</strong>
                        <small className="bk-csb-hint">
                          {selectedSlot === 'AM' ? '☀️ 09:00 AM (Day Arrival)' : selectedSlot === 'PM' ? '🌙 06:00 PM (Night Arrival)' : '🌟 09:00 AM (24h Check-in)'}
                        </small>
                      </div>
                      <div className="bk-csb-arrow">→</div>
                      <div className="bk-csb-col">
                        <span className="bk-csb-label">CHECK-OUT</span>
                        <strong className="bk-csb-date">{endDate ? formatDisplayDate(endDate) : 'Select date'}</strong>
                        <small className="bk-csb-hint">
                          {selectedSlot === 'AM' ? '☀️ 05:00 PM (Same Day)' : selectedSlot === 'PM' ? '🌙 09:00 AM (Next Day)' : '🌟 09:00 AM (Next Day)'}
                        </small>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="bk-continue-addons-btn"
                      onClick={() => setCurrentStep(2)}
                    >
                      Continue to Add-ons →
                    </button>
                  </div>

                  {/* Right Column: Standard Allocations & Manifest */}
                  <div className="bk-alloc-pane">
                    <div className="bk-quick-select-label">QUICK SELECT STANDARD ALLOCATIONS:</div>

                    <div className="bk-alloc-row">
                      {COUPLE_ALLOCATIONS.map(alloc => (
                        <div
                          key={alloc.count}
                          className={`bk-alloc-pill ${selectedCoupleCount === alloc.count ? 'selected' : ''}`}
                          onClick={() => handleSelectCouple(alloc)}
                        >
                          <h4>{alloc.label}</h4>
                          <p>{alloc.sub}</p>
                        </div>
                      ))}
                    </div>

                    <div className="bk-features-triplet">
                      <div className="bk-feat-card">
                        <span className="bk-feat-icon">🛎️</span>
                        <div className="bk-feat-text">
                          <strong>Private Check-in &amp; Host</strong>
                          <p>Direct concierge greeting on arrival</p>
                        </div>
                      </div>

                      <div className="bk-feat-card">
                        <span className="bk-feat-icon">🏊</span>
                        <div className="bk-feat-text">
                          <strong>Exclusive Pool &amp; Lawn</strong>
                          <p>No shared access with outside guests</p>
                        </div>
                      </div>

                      <div className="bk-feat-card">
                        <span className="bk-feat-icon">🍳</span>
                        <div className="bk-feat-text">
                          <strong>Farmhouse Breakfast</strong>
                          <p>Fresh estate kitchen morning menu</p>
                        </div>
                      </div>
                    </div>

                    <div className="bk-official-manifest">
                      <div className="bk-om-header">
                        <div className="bk-om-title-group">
                          <span className="bk-om-title">OFFICIAL RESERVATION MANIFEST</span>
                          <span className="bk-om-ref">REF: EST-{selectedSlot}-{selectedCoupleCount}X{selectedCoupleCount * 2}</span>
                        </div>
                        <button
                          type="button"
                          className="bk-om-promo-btn"
                          onClick={() => handleApplyPromoCode('POOL20')}
                        >
                          {isOfferActive ? '✓ 20% Promo Applied' : 'Apply 20% Promo'}
                        </button>
                      </div>

                      <div className="bk-om-grid">
                        <div className="bk-om-cell">
                          <span className="bk-om-label">BOOKED SLOT</span>
                          <strong className="bk-om-val bk-slot-highlight">
                            {selectedSlot === 'AM' ? '☀️ Day Only (9AM-5PM)' : selectedSlot === 'PM' ? '🌙 Night Only (6PM-9AM)' : '🌟 All Day (Full 24h)'}
                          </strong>
                        </div>
                        <div className="bk-om-cell">
                          <span className="bk-om-label">TOTAL COUPLES</span>
                          <strong className="bk-om-val">{selectedCoupleCount} Couple{selectedCoupleCount > 1 ? 's' : ''}</strong>
                        </div>
                        <div className="bk-om-cell">
                          <span className="bk-om-label">TOTAL GUEST COUNT</span>
                          <strong className="bk-om-val">{selectedCoupleCount * 2} Registered Adults</strong>
                        </div>
                        <div className="bk-om-cell">
                          <span className="bk-om-label">ACCOMMODATIONS</span>
                          <strong className="bk-om-val">{selectedCoupleCount} Private Master Suite{selectedCoupleCount > 1 ? 's' : ''}</strong>
                        </div>
                      </div>

                      <div className="bk-om-footer-note">
                        <span className="bk-om-shield">🛡️</span>
                        <span>Verified Estate Standard: Guaranteed private premises, sanitized luxury linens, and dedicated caretaker.</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Promo Code & Itemized Math */}
                <div className="bk-promo-section">
                  <div className="bk-promo-header">
                    <div className="bk-promo-title-group">
                      <span className="bk-promo-icon">🏷️</span>
                      <div>
                        <h4>Special Offers &amp; Promo Codes</h4>
                        <p>Select any active discount below or enter your private promo coupon</p>
                      </div>
                    </div>
                    <Link to="/offers" target="_blank" className="bk-view-all-offers-link">
                      View All Offers ➔
                    </Link>
                  </div>

                  <div className="bk-promo-input-row">
                    <input
                      type="text"
                      placeholder="Enter promo coupon (e.g. POOL20)"
                      value={inputCouponCode}
                      onChange={e => setInputCouponCode(e.target.value)}
                    />
                    {isOfferActive ? (
                      <button
                        type="button"
                        className="bk-btn-remove-code"
                        onClick={handleRemoveOffer}
                      >
                        Remove Offer ✕
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="bk-btn-apply-code"
                        onClick={() => handleApplyPromoCode()}
                      >
                        Apply Code
                      </button>
                    )}
                  </div>

                  {error && <p className="bk-promo-error-msg">{error}</p>}

                  {isOfferActive && appliedOffer && (
                    <div className="bk-promo-success-badge">
                      <div className="bk-badge-content">
                        <span className="bk-badge-icon">✓</span>
                        <div>
                          <strong>{appliedOffer.code} ({appliedOffer.percent}% OFF)</strong> — {appliedOffer.title}
                          <p>Deducted <strong>-₹ {discountAmount.toLocaleString()}</strong> from your reservation total.</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="bk-quick-promo-tags">
                    <span className="bk-tags-label">Available Discounts:</span>
                    <div className="bk-chips-wrap">
                      {ACTIVE_OFFERS.map(offer => {
                        const isSelected = isOfferActive && appliedOffer?.code === offer.code;
                        return (
                          <button
                            key={offer.code}
                            type="button"
                            className={`bk-promo-chip ${isSelected ? 'active' : ''}`}
                            onClick={() => handleApplyPromoCode(offer.code)}
                          >
                            <span className="chip-icon">{offer.icon}</span>
                            <strong>{offer.code}</strong>
                            <span className="chip-discount">({offer.percent}% OFF)</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="bk-itemized-calc-box">
                  <h4 className="calc-title">Price Breakdown &amp; Calculation</h4>
                  
                  <div className="calc-row">
                    <span>
                      {selectedSlot === 'AM' ? '☀️ Day Slot Rate (09:00 AM - 05:00 PM):' : selectedSlot === 'PM' ? '🌙 Night Slot Rate (06:00 PM - 09:00 AM):' : '🌟 All Day Base Rate (24 Hours):'}
                    </span>
                    <span>₹ {basePrice.toLocaleString()}</span>
                  </div>

                  <div className="calc-row calc-subtotal-row">
                    <span>Subtotal Fare:</span>
                    <span>₹ {subtotal.toLocaleString()}</span>
                  </div>

                  {isOfferActive && appliedOffer && (
                    <div className="calc-row calc-discount-row">
                      <span>
                        🏷️ Discount ({appliedOffer.code} • {appliedOffer.percent}%):
                      </span>
                      <strong className="discount-minus">- ₹ {discountAmount.toLocaleString()}</strong>
                    </div>
                  )}

                  <div className="calc-row">
                    <span>Taxes &amp; GST (10% on Net Fare):</span>
                    <span>+ ₹ {taxes.toLocaleString()}</span>
                  </div>

                  <div className="calc-divider"></div>

                  <div className="calc-row calc-final-row">
                    <div className="final-label-group">
                      <strong>Final Payable Amount:</strong>
                      {isOfferActive && (
                        <span className="savings-tag">You Saved ₹ {discountAmount.toLocaleString()}! 🎉</span>
                      )}
                    </div>
                    <strong className="final-amount-val">₹ {grandTotal.toLocaleString()}</strong>
                  </div>
                </div>

                <div className="bk-action-footer">
                  <button
                    type="button"
                    className="bk-btn-book-now"
                    onClick={() => setCurrentStep(2)}
                  >
                    <span>Proceed to Add-ons</span>
                    <span className="arrow">➔</span>
                  </button>
                  <p className="bk-secure-text">🔒 100% Secure Booking</p>
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════
                STEP 2: ENHANCED INTERACTIVE ADD-ONS HUB (CLEAN CATALOG)
                ══════════════════════════════════════════ */}
            {currentStep === 2 && (
              <div className="bk-card-box bk-addons-full-wrapper">
                {/* ── Section Header ── */}
                <div className="bk-addons-hero-head">
                  <div className="bk-ahh-left">
                    <span className="bk-pill-badge">💎 Luxury Enhancements</span>
                    <h2 className="bk-addons-main-title">Curate Your Bespoke Farmhouse Experience</h2>
                    <p className="bk-addons-main-sub">
                      Tailor your stay with private chefs, live barbecue masters, wellness spas, DJ sound systems, and starry lawn cinema.
                    </p>
                  </div>

                  <div className="bk-ahh-stat-card">
                    <div className="bk-stat-circle">{activeAddonCount}</div>
                    <div className="bk-stat-info">
                      <strong>Selected Add-ons</strong>
                      <span>+ ₹ {addonTotal.toLocaleString()} total value</span>
                    </div>
                  </div>
                </div>

                {/* ── Dynamic Luxury Tier / Perk Unlock Progress Bar ── */}
                <div className="bk-luxury-meter-card">
                  <div className="bk-lm-top">
                    <div className="bk-lm-title">
                      <span className="bk-lm-badge">{experienceTier.title}</span>
                      <span className="bk-lm-score">{activeAddonCount}/5 Experiences Added</span>
                    </div>
                    <div className="bk-lm-perk">{experienceTier.perk}</div>
                  </div>

                  <div className="bk-lm-track">
                    <div 
                      className="bk-lm-fill" 
                      style={{ width: `${experienceTier.percent}%`, backgroundColor: experienceTier.color }}
                    ></div>
                  </div>

                  <div className="bk-lm-steps">
                    <span className={activeAddonCount >= 0 ? 'reached' : ''}>🌱 Standard</span>
                    <span className={activeAddonCount >= 1 ? 'reached' : ''}>🥉 Silver Mocktails</span>
                    <span className={activeAddonCount >= 3 ? 'reached' : ''}>🥈 Gold VIP Perk</span>
                    <span className={activeAddonCount >= 5 ? 'reached' : ''}>🥇 Royal Butler</span>
                  </div>
                </div>

                {/* ── Search & Filter Navigation Tabs ── */}
                <div className="bk-filter-bar">
                  <div className="bk-filter-tabs">
                    {CATEGORY_TABS.map(tab => (
                      <button
                        key={tab.key}
                        type="button"
                        className={`bk-tab-btn ${selectedCategory === tab.key ? 'active' : ''}`}
                        onClick={() => setSelectedCategory(tab.key)}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  <div className="bk-search-wrap">
                    <span className="bk-search-icon">🔍</span>
                    <input
                      type="text"
                      placeholder="Search add-on or cuisine..."
                      value={addonSearch}
                      onChange={e => setAddonSearch(e.target.value)}
                    />
                    {addonSearch && (
                      <button 
                        type="button" 
                        className="bk-search-clear" 
                        onClick={() => setAddonSearch('')}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>

                {/* ── Rich Interactive Add-ons Catalog ── */}
                <div className="bk-rich-catalog-grid">
                  {filteredAddons.map(addon => {
                    const isSelected = !!selectedAddons[addon.key];
                    const cfg = addonConfigurations[addon.key] || { qty: 1, timeSlot: '', option: '' };
                    const itemQty = addon.isPerGuest ? (cfg.qty || selectedCoupleCount * 2) : (cfg.qty || 1);
                    const itemCost = addon.price * itemQty;

                    return (
                      <div
                        key={addon.key}
                        className={`bk-rich-addon-card ${isSelected ? 'selected' : ''}`}
                      >
                        {/* Card Header with Badges */}
                        <div className="bk-rac-header">
                          <span className="bk-rac-badge">{addon.badge}</span>
                          <div className="bk-rac-rating">
                            <span>⭐ {addon.rating}</span>
                            <small>({addon.reviewsCount})</small>
                          </div>
                        </div>

                        {/* Main Title & Icon */}
                        <div className="bk-rac-main">
                          <span className="bk-rac-icon">{addon.icon}</span>
                          <div>
                            <h4 className="bk-rac-title">{addon.label}</h4>
                            <p className="bk-rac-tagline">{addon.tagline}</p>
                          </div>
                        </div>

                        {/* Interactive Controls when Selected */}
                        {isSelected && (
                          <div className="bk-rac-config-panel">
                            {/* Option Selector (Cuisine / Theme) */}
                            {addon.options && addon.options.length > 0 && (
                              <div className="bk-rac-field">
                                <label>{addon.optionsLabel || 'Select Style'}:</label>
                                <select
                                  value={cfg.option || addon.options[0]}
                                  onChange={e => handleUpdateAddonConfig(addon.key, 'option', e.target.value)}
                                >
                                  {addon.options.map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                  ))}
                                </select>
                              </div>
                            )}

                            {/* Preferred Time Slot */}
                            {addon.timeSlots && addon.timeSlots.length > 0 && (
                              <div className="bk-rac-field">
                                <label>Preferred Schedule:</label>
                                <div className="bk-rac-time-chips">
                                  {addon.timeSlots.map(slot => (
                                    <button
                                      key={slot}
                                      type="button"
                                      className={`bk-time-chip ${cfg.timeSlot === slot ? 'active' : ''}`}
                                      onClick={() => handleUpdateAddonConfig(addon.key, 'timeSlot', slot)}
                                    >
                                      {slot}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Quantity / Guest Multiplier */}
                            <div className="bk-rac-qty-row">
                              <span className="bk-rac-qty-label">
                                {addon.isPerGuest ? 'Guests Included:' : 'Quantity / Setup:'}
                              </span>
                              <div className="bk-rac-stepper">
                                <button
                                  type="button"
                                  onClick={() => handleUpdateAddonConfig(addon.key, 'qty', Math.max(1, (cfg.qty || 1) - 1))}
                                >
                                  -
                                </button>
                                <span>{itemQty}</span>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateAddonConfig(addon.key, 'qty', (cfg.qty || 1) + 1)}
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Card Footer with Price and Actions */}
                        <div className="bk-rac-footer">
                          <div className="bk-rac-price-block">
                            <div className="bk-rac-price">
                              <strong>₹ {itemCost.toLocaleString()}</strong>
                              <small>({addon.unit})</small>
                            </div>
                            <button
                              type="button"
                              className="bk-btn-inclusions-link"
                              onClick={() => setPreviewModalAddon(addon)}
                            >
                              🔍 View Inclusions &amp; Menu
                            </button>
                          </div>

                          <button
                            type="button"
                            className={`bk-btn-addon-toggle ${isSelected ? 'selected' : ''}`}
                            onClick={() => handleToggleAddon(addon.key)}
                          >
                            {isSelected ? '✓ Added' : '+ Add to Stay'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* ── Custom Concierge Requests & Quick Chips ── */}
                <div className="bk-concierge-request-box">
                  <div className="bk-cr-header">
                    <span className="bk-cr-icon">🛎️</span>
                    <div>
                      <h4>Special Estate Requests &amp; Concierge Notes</h4>
                      <p>Have custom requirements, dietary preferences, or surprise arrangements?</p>
                    </div>
                  </div>

                  <div className="bk-cr-tags-wrap">
                    <span className="bk-cr-tag-label">Quick Suggestions:</span>
                    <div className="bk-cr-chips">
                      {QUICK_TAGS.map(tag => (
                        <button
                          key={tag}
                          type="button"
                          className="bk-cr-chip"
                          onClick={() => handleAddQuickTag(tag)}
                        >
                          + {tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  <textarea
                    rows="2"
                    placeholder="E.g. We are celebrating our 5th anniversary. Please keep champagne glasses chilled and prepare extra firewood..."
                    value={specialRequests}
                    onChange={e => setSpecialRequests(e.target.value)}
                  ></textarea>
                </div>

                {/* ── Live Sticky Price & Savings Summary Widget ── */}
                <div className="bk-itemized-calc-box bk-calc-addons-sticky">
                  <h4 className="calc-title">Live Reservation &amp; Experience Total</h4>
                  
                  <div className="calc-row">
                    <span>Base Farmhouse Stay ({selectedSlot === 'AM' ? 'Day Slot' : `${nights} night(s)`}):</span>
                    <span>₹ {basePrice.toLocaleString()}</span>
                  </div>

                  {addonTotal > 0 && (
                    <div className="calc-row">
                      <span>Selected Add-ons ({activeAddonCount} experiences):</span>
                      <strong>+ ₹ {addonTotal.toLocaleString()}</strong>
                    </div>
                  )}

                  <div className="calc-row calc-subtotal-row">
                    <span>Subtotal Fare:</span>
                    <span>₹ {subtotal.toLocaleString()}</span>
                  </div>

                  {isOfferActive && appliedOffer && (
                    <div className="calc-row calc-discount-row">
                      <span>
                        🏷️ Discount ({appliedOffer.code} • {appliedOffer.percent}% OFF):
                      </span>
                      <strong className="discount-minus">- ₹ {discountAmount.toLocaleString()}</strong>
                    </div>
                  )}

                  <div className="calc-row">
                    <span>Taxes &amp; GST (10% on Net Fare):</span>
                    <span>+ ₹ {taxes.toLocaleString()}</span>
                  </div>

                  <div className="calc-divider"></div>

                  <div className="calc-row calc-final-row">
                    <div className="final-label-group">
                      <strong>Grand Total with Experiences:</strong>
                      {isOfferActive && (
                        <span className="savings-tag">Total Savings: ₹ {discountAmount.toLocaleString()}! 🎉</span>
                      )}
                    </div>
                    <strong className="final-amount-val">₹ {grandTotal.toLocaleString()}</strong>
                  </div>
                </div>

                {/* Navigation Buttons */}
                <div className="bk-buttons-split">
                  <button
                    type="button"
                    className="bk-btn-outline"
                    onClick={() => setCurrentStep(1)}
                  >
                    ‹ Back to Dates &amp; Slot
                  </button>
                  <button
                    type="button"
                    className="bk-btn-book-now"
                    onClick={() => setCurrentStep(3)}
                  >
                    <span>Proceed to Payment</span>
                    <span className="arrow">➔</span>
                  </button>
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════
                STEP 3: PAYMENT
                ══════════════════════════════════════════ */}
            {currentStep === 3 && (
              <div className="bk-card-box">
                <div className="bk-step-header">
                  <h3 className="bk-section-title">Select Secure Payment Gateway</h3>
                  <p className="bk-section-sub">Choose your preferred gateway to confirm your stay and experiences.</p>
                </div>

                <div className="bk-payment-grid">
                  {PAYMENT_METHODS.map(method => (
                    <div
                      key={method.key}
                      className={`bk-payment-box ${paymentMethod === method.key ? 'selected' : ''}`}
                      onClick={() => setPaymentMethod(method.key)}
                    >
                      <span className="bk-pay-icon">{method.icon}</span>
                      <div className="bk-pay-info">
                        <h4>{method.label}</h4>
                        <p>{method.desc}</p>
                      </div>
                      <div className="bk-pay-radio">
                        {paymentMethod === method.key && <div className="bk-radio-inner"></div>}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Final Verified Calculation Summary */}
                <div className="bk-itemized-calc-box">
                  <h4 className="calc-title">Final Verified Reservation Manifest</h4>
                  
                  <div className="calc-row">
                    <span>
                      Stay Rate ({selectedSlot === 'AM' ? 'Day Slot' : `${nights} nights`} • {guestCount}):
                    </span>
                    <span>₹ {basePrice.toLocaleString()}</span>
                  </div>

                  {addonTotal > 0 && (
                    <div className="calc-row">
                      <span>Add-ons ({selectedAddonKeys.length} selected):</span>
                      <span>+ ₹ {addonTotal.toLocaleString()}</span>
                    </div>
                  )}

                  {/* Selected Addon Line Items */}
                  {selectedAddonKeys.map(key => {
                    const item = ADDON_LIST.find(a => a.key === key);
                    const cfg = addonConfigurations[key];
                    const itemQty = item?.isPerGuest ? (cfg?.qty || selectedCoupleCount * 2) : (cfg?.qty || 1);
                    return (
                      <div key={key} className="calc-sub-item-row">
                        <span>• {item?.icon} {item?.label} ({cfg?.option || 'Standard'}) × {itemQty}:</span>
                        <span>₹ {(item?.price * itemQty).toLocaleString()}</span>
                      </div>
                    );
                  })}

                  <div className="calc-row calc-subtotal-row">
                    <span>Subtotal:</span>
                    <span>₹ {subtotal.toLocaleString()}</span>
                  </div>

                  {isOfferActive && appliedOffer && (
                    <div className="calc-row calc-discount-row">
                      <span>
                        🏷️ Discount ({appliedOffer.code} • {appliedOffer.percent}% OFF):
                      </span>
                      <strong className="discount-minus">- ₹ {discountAmount.toLocaleString()}</strong>
                    </div>
                  )}

                  <div className="calc-row">
                    <span>Taxes &amp; GST (10%):</span>
                    <span>+ ₹ {taxes.toLocaleString()}</span>
                  </div>

                  <div className="calc-divider"></div>

                  <div className="calc-row calc-final-row">
                    <div className="final-label-group">
                      <strong>Total Amount Payable:</strong>
                      {isOfferActive && (
                        <span className="savings-tag">Total Savings: ₹ {discountAmount.toLocaleString()}</span>
                      )}
                    </div>
                    <strong className="final-amount-val">₹ {grandTotal.toLocaleString()}</strong>
                  </div>
                </div>

                <div className="bk-buttons-split">
                  <button
                    type="button"
                    className="bk-btn-outline"
                    onClick={() => setCurrentStep(2)}
                  >
                    ‹ Back to Add-ons
                  </button>
                  <button
                    type="button"
                    className="bk-btn-book-now"
                    disabled={bookingLoading}
                    onClick={handleCompleteBooking}
                  >
                    {bookingLoading ? 'Processing Secure Payment...' : `Pay ₹ ${grandTotal.toLocaleString()} & Confirm Booking 🔒`}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── 4. Interactive Inclusions Modal ── */}
      {previewModalAddon && (
        <div className="bk-modal-backdrop" onClick={() => setPreviewModalAddon(null)}>
          <div className="bk-modal-box" onClick={e => e.stopPropagation()}>
            <button 
              type="button" 
              className="bk-modal-close" 
              onClick={() => setPreviewModalAddon(null)}
            >
              ✕
            </button>

            <div className="bk-modal-header">
              <span className="bk-modal-icon">{previewModalAddon.icon}</span>
              <div>
                <span className="bk-modal-badge">{previewModalAddon.badge}</span>
                <h3>{previewModalAddon.label}</h3>
                <p className="bk-modal-tagline">{previewModalAddon.tagline}</p>
              </div>
            </div>

            <div className="bk-modal-body">
              <p className="bk-modal-desc">{previewModalAddon.desc}</p>

              <div className="bk-modal-inclusions">
                <h4>✨ What’s Included in this Experience:</h4>
                <ul>
                  {previewModalAddon.inclusions?.map((inc, i) => (
                    <li key={i}>✓ {inc}</li>
                  ))}
                </ul>
              </div>

              {previewModalAddon.options && (
                <div className="bk-modal-options">
                  <h4>🍽️ Available Styles / Themes:</h4>
                  <div className="bk-modal-tags">
                    {previewModalAddon.options.map(opt => (
                      <span key={opt} className="bk-modal-pill">{opt}</span>
                    ))}
                  </div>
                </div>
              )}

              <div className="bk-modal-rating-summary">
                <div className="bk-mrs-score">
                  <strong>⭐ {previewModalAddon.rating}</strong>
                  <span>Guest Rating</span>
                </div>
                <div className="bk-mrs-count">
                  <span>Based on {previewModalAddon.reviewsCount}+ verified estate reviews</span>
                </div>
              </div>
            </div>

            <div className="bk-modal-footer">
              <div className="bk-modal-price">
                <strong>₹ {previewModalAddon.price.toLocaleString()}</strong>
                <small>/{previewModalAddon.unit}</small>
              </div>

              <button
                type="button"
                className={`bk-btn-modal-add ${selectedAddons[previewModalAddon.key] ? 'added' : ''}`}
                onClick={() => {
                  handleToggleAddon(previewModalAddon.key);
                  setPreviewModalAddon(null);
                }}
              >
                {selectedAddons[previewModalAddon.key] ? 'Remove from Stay' : '+ Add to My Stay'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BookingPage;
