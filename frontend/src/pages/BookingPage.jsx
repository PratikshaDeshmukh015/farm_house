import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { bookingAPI, discountAPI, farmhouseAPI } from '../api/axiosInstance';
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

const DEFAULT_OFFERS = [
  { code: 'POOL20', percent: 20, title: 'Pool Party Special', tagline: 'Special discount for pool & lawn reservations', icon: '🏊' },
  { code: 'WEEKEND15', percent: 15, title: 'Weekend Special', tagline: '15% discount for weekend stays', icon: '☀️' },
  { code: 'NATURE10', percent: 10, title: 'Nature Escape Discount', tagline: '10% instant discount on eco escapes', icon: '🌿' },
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
  const [bookedSlots, setBookedSlots] = useState({});

  // Step 3 Add-ons Configuration State
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

  // Promo Code State - default to POOL20 for 20% discount as in design
  const initialCode = searchParams.get('code') || 'POOL20';
  const [availableOffers, setAvailableOffers] = useState(DEFAULT_OFFERS);
  const [offersLoaded, setOffersLoaded] = useState(true);
  const [inputCouponCode, setInputCouponCode] = useState(initialCode);
  const [appliedOffer, setAppliedOffer] = useState(DEFAULT_OFFERS[0]);
  const [isOfferActive, setIsOfferActive] = useState(true);

  useEffect(() => {
    fetchFarmhouseDetails();
    const activeFarmhouseId = farmhouseId || '1';
    setBookedSlots({});
    fetchBookedDates(activeFarmhouseId);
  }, [farmhouseId]);

  useEffect(() => {
    let isMounted = true;
    const todayObj = new Date();
    todayObj.setHours(0, 0, 0, 0);

    discountAPI.getActiveDiscounts()
      .then(response => {
        const discounts = response.data?.success && Array.isArray(response.data.discounts)
          ? response.data.discounts
          : [];
        if (discounts.length > 0) {
          const offers = discounts
            .filter(offer => offer && offer.isActive !== false && Number(offer.discountPercent) > 0)
            .filter(offer => !offer.validFrom || new Date(`${offer.validFrom}T00:00:00`) <= todayObj)
            .filter(offer => !offer.validTo || new Date(`${offer.validTo}T00:00:00`) >= todayObj)
            .map(offer => ({
              code: offer.code || `DISCOUNT-${offer.id}`,
              percent: Number(offer.discountPercent),
              title: offer.title || 'Farmhouse discount',
              tagline: offer.specialOffer || offer.description || 'Active farmhouse discount',
              icon: offer.farmhouseType === 'POOL_PARTY' ? '🏊' : '🏡'
            }));

          if (isMounted && offers.length > 0) {
            setAvailableOffers(offers);
          }
        }
      })
      .catch(err => {
        console.warn('Could not load active booking discounts, using default offers:', err.message);
      })
      .finally(() => {
        if (isMounted) setOffersLoaded(true);
      });

    return () => {
      isMounted = false;
    };
  }, [farmhouseId]);

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
        const nextMap = {};
        response.data.bookings.forEach(b => {
          // The endpoint is scoped to this farmhouse; keep the client guard too.
          if (String(b.farmHouseId) !== String(id) || b.status === 'CANCELLED' || !b.startDate || !b.endDate) return;

          const [startYear, startMonth, startDay] = b.startDate.split('-').map(Number);
          const [endYear, endMonth, endDay] = b.endDate.split('-').map(Number);
          const current = new Date(startYear, startMonth - 1, startDay);
          const checkout = new Date(endYear, endMonth - 1, endDay);
          const slot = (b.timeSlot || 'FULL_DAY').toUpperCase();

          // For multi-day bookings checkout is exclusive; a same-day booking
          // still occupies its selected date.
          while (current < checkout || (current.getTime() === checkout.getTime() && current.getTime() === new Date(startYear, startMonth - 1, startDay).getTime())) {
            const key = toDateKey(current);
            const currentData = nextMap[key] || { day: false, night: false };
            if (slot === 'AM' || slot === 'DAY') currentData.day = true;
            else if (slot === 'PM' || slot === 'NIGHT') currentData.night = true;
            else {
              currentData.day = true;
              currentData.night = true;
            }
            nextMap[key] = currentData;
            if (current.getTime() === checkout.getTime()) break;
            current.setDate(current.getDate() + 1);
          }
        });
        setBookedSlots(nextMap);
      }
    } catch (err) {
      setBookedSlots({});
    }
  };

  const getSlotData = (dateKey) => {
    return bookedSlots[dateKey] || { day: false, night: false };
  };

  const isSlotAvailable = (dateKey, slotKey) => {
    if (!dateKey) return true;
    const slotInfo = getSlotData(dateKey);
    if (slotKey === 'AM' || slotKey === 'DAY') {
      return !slotInfo.day;
    }
    if (slotKey === 'PM' || slotKey === 'NIGHT') {
      return !slotInfo.night;
    }
    if (slotKey === 'FULL_DAY') {
      return !slotInfo.day && !slotInfo.night;
    }
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

  // Total payable matching clean math shown in Image 2
  const grandTotal = subtotal - discountAmount;

  // Active Addon Count
  const selectedAddonKeys = Object.keys(selectedAddons).filter(k => selectedAddons[k]);
  const activeAddonCount = selectedAddonKeys.length;

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
    const found = availableOffers.find(o => o.code.toUpperCase() === rawCode);

    if (found) {
      setInputCouponCode(found.code);
      setAppliedOffer(found);
      setIsOfferActive(true);
      setError('');
      const savedAmount = Math.round(subtotal * (found.percent / 100));
      showToast(`Promo "${found.code}" applied! Saved ₹${savedAmount.toLocaleString()} 🎉`);
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

  const handleResetToToday = () => {
    setCalendarMonth(new Date());
  };

  // Slot click booking handler
  const handleSlotPick = (day, slot) => {
    if (!day) return;
    const key = toDateKey(day);
    const todayStr = toDateKey(new Date());
    if (key < todayStr) return;

    const slotInfo = getSlotData(key);

    if (slot === 'AM' && slotInfo.day) {
      setCalendarError(`🔴 Date ${formatDisplayDate(key)}: Day Slot (09:00 AM - 05:00 PM) is BOOKED (Red). No one else can book this slot for this farmhouse.`);
      showToast(`🔴 Day Slot on ${formatDisplayDate(key)} is already booked! Please choose Night or another date.`);
      setTimeout(() => setCalendarError(''), 4500);
      return;
    }
    if (slot === 'PM' && slotInfo.night) {
      setCalendarError(`🔴 Date ${formatDisplayDate(key)}: Night Slot (06:00 PM - 09:00 AM) is BOOKED (Red). No one else can book this slot for this farmhouse.`);
      showToast(`🔴 Night Slot on ${formatDisplayDate(key)} is already booked! Please choose Day or another date.`);
      setTimeout(() => setCalendarError(''), 4500);
      return;
    }
    if (slot === 'FULL_DAY' && (slotInfo.day || slotInfo.night)) {
      setCalendarError(`🔴 Date ${formatDisplayDate(key)}: All Day (24h) stay requires both Day & Night open. One or more slots are already booked in Red.`);
      showToast(`🔴 24h Full Day booking unavailable due to existing slot booking on this date.`);
      setTimeout(() => setCalendarError(''), 4500);
      return;
    }

    setCalendarError('');
    setSelectedSlot(slot);
    setStartDate(key);

    if (slot === 'AM') {
      setEndDate(key);
      showToast(`🟢 Selected ☀️ Day Only Slot for ${formatDisplayDate(key)}!`);
    } else {
      const nextD = new Date(day);
      nextD.setDate(nextD.getDate() + 1);
      setEndDate(toDateKey(nextD));
      showToast(slot === 'PM' 
        ? `🟢 Selected 🌙 Night Only Slot for ${formatDisplayDate(key)}!` 
        : `🟢 Selected 🌟 All Day Slot (24h) for ${formatDisplayDate(key)}!`
      );
    }
  };

  const handleProceedToStep2 = () => {
    if (!isSlotAvailable(startDate, selectedSlot)) {
      const slotName = selectedSlot === 'AM' ? 'Day Slot' : selectedSlot === 'PM' ? 'Night Slot' : 'All Day (Full 24h)';
      setCalendarError(`⚠️ Cannot proceed: ${slotName} on ${formatDisplayDate(startDate)} is already booked. Please choose an available green slot.`);
      showToast(`⚠️ This slot is already booked for this farmhouse! Please pick a green slot.`);
      return;
    }
    setCalendarError('');
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
        farmHouseId: farmhouseId || farmhouse?.id,
        startDate,
        endDate: endDate || startDate,
        numberOfGuests: parseInt(guestCount) || selectedCoupleCount * 2,
        specialRequirements: specialRequests,
        timeSlot: selectedSlot,
        totalPrice: grandTotal
      };

      const response = await bookingAPI.createBooking(payload, user?.id);
      if (!response.data?.success || !response.data?.booking) {
        throw new Error(response.data?.message || 'The reservation could not be saved.');
      }
      await fetchBookedDates(String(payload.farmHouseId));
      setBookingDone(true);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Booking processing failed. Please try again.');
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
    <div className={`bk-page-root bk-step-${currentStep}`}>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="bk-toast-banner">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── 1. Luxury Hero Banner (Shown on Step 1) ── */}
      {currentStep === 1 && (
        <section className="bk-luxury-hero-banner">
          <div className="bk-lhb-content">
            <div className="bk-lhb-badge">
              <span className="bk-lhb-leaf">🌿</span> Luxury Farm Stays
            </div>
            <h1 className="bk-lhb-title">Your Perfect Farm Stay Awaits</h1>
            <p className="bk-lhb-sub">Relax in nature, enjoy fresh air and create beautiful memories.</p>
            
            <div className="bk-lhb-features-row">
              <div className="bk-lhb-feat-pill">
                <span className="bk-pill-icon">🛏️</span> Comfortable Stays
              </div>
              <div className="bk-lhb-feat-pill">
                <span className="bk-pill-icon">🏞️</span> Nature Views
              </div>
              <div className="bk-lhb-feat-pill">
                <span className="bk-pill-icon">🎪</span> Farm Activities
              </div>
              <div className="bk-lhb-feat-pill">
                <span className="bk-pill-icon">🍽️</span> Delicious Food
              </div>
            </div>
          </div>
          <div className="bk-lhb-image-wrap">
            <img 
              src={farmhouse?.imageUrl || 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=1200&auto=format&fit=crop'} 
              alt="Luxury Farm Stay" 
              className="bk-lhb-img" 
            />
          </div>
        </section>
      )}

      {/* ── 2. Booking Details Header (Shown on Step 2, 3, 4) ── */}
      {currentStep > 1 && !bookingDone && (
        <section className="bk-details-hero-banner">
          <div className="bk-dhb-left">
            <div className="bk-dhb-badge">
              <span>📅</span> BOOKING DETAILS
            </div>
            <h1 className="bk-dhb-title">{farmhouse?.name || 'Luxury Mountain Villa'}</h1>
            <p className="bk-dhb-loc">
              <span className="bk-loc-pin">📍</span> {farmhouse?.location || 'Himachal Pradesh'}
            </p>
          </div>
          <div className="bk-dhb-right">
            <div className="bk-dhb-thumb-box">
              <img 
                src={farmhouse?.imageUrl || 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=1200&auto=format&fit=crop'} 
                alt={farmhouse?.name} 
              />
              <div className="bk-dhb-price-badge">
                ₹ {farmhouse?.pricePerDay ? farmhouse.pricePerDay.toLocaleString() : '5,000'} / night
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── 3. Step Progress Breadcrumb Navigation ── */}
      <div className="bk-flow-nav-container">
        <div className="bk-flow-nav-bar">
          <button
            type="button"
            className={`bk-flow-tab ${currentStep === 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}
            onClick={() => setCurrentStep(1)}
          >
            <span className="bk-tab-step">1</span>
            <span>Dates &amp; Slot</span>
          </button>
          <span className="bk-flow-arrow">›</span>

          <button
            type="button"
            className={`bk-flow-tab ${currentStep === 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}
            onClick={() => setCurrentStep(2)}
          >
            <span className="bk-tab-step">2</span>
            <span>Review &amp; Offers</span>
          </button>
          <span className="bk-flow-arrow">›</span>

          <button
            type="button"
            className={`bk-flow-tab ${currentStep === 3 ? 'active' : ''} ${currentStep > 3 ? 'completed' : ''}`}
            onClick={() => setCurrentStep(3)}
          >
            <span className="bk-tab-step">3</span>
            <span>Add-ons &amp; Experiences {activeAddonCount > 0 && <span className="bk-addon-badge-count">{activeAddonCount}</span>}</span>
          </button>
          <span className="bk-flow-arrow">›</span>

          <button
            type="button"
            className={`bk-flow-tab ${currentStep === 4 ? 'active' : ''}`}
            onClick={() => setCurrentStep(4)}
          >
            <span className="bk-tab-step">4</span>
            <span>Payment</span>
          </button>
        </div>
      </div>

      {/* ── 4. Main Body Wrapper ── */}
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
                  {selectedSlot === 'AM' ? '☀️ Day Only (09:00 AM - 05:00 PM)' : selectedSlot === 'PM' ? '🌙 Night Only (06:00 PM - 09:00 AM)' : '🌟 All Day (Full 24h)'}
                </strong>
              </div>
              <div className="bk-receipt-item">
                <span>Check-in:</span>
                <span>{formatDisplayDate(startDate)}</span>
              </div>
              <div className="bk-receipt-item">
                <span>Check-out:</span>
                <span>{formatDisplayDate(endDate || startDate)}</span>
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
          <div className="bk-step-views-container">
            {/* ══════════════════════════════════════════
                STEP 1: DATES, SLOTS, ALLOCATIONS & MANIFEST (SCREEN 1)
                ══════════════════════════════════════════ */}
            {currentStep === 1 && (
              <div className="bk-screen-1-grid">
                {/* ── Left Column: Interactive Calendar & Slot Types ── */}
                <div className="bk-cal-column-card">
                  {/* Calendar Top Month Navigation */}
                  <div className="bk-cal-header-bar">
                    <div className="bk-cal-month-title-wrap">
                      <span className="bk-cal-icon-green">📅</span>
                      <h3 className="bk-cal-month-title">
                        {calendarMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </h3>
                    </div>
                    <div className="bk-cal-nav-buttons">
                      <button 
                        type="button" 
                        className="bk-cal-nav-btn" 
                        onClick={handlePrevMonth}
                        title="Previous Month"
                      >
                        ‹
                      </button>
                      <button
                        type="button"
                        className="bk-cal-today-btn"
                        onClick={handleResetToToday}
                      >
                        Today
                      </button>
                      <button 
                        type="button" 
                        className="bk-cal-nav-btn" 
                        onClick={handleNextMonth}
                        title="Next Month"
                      >
                        ›
                      </button>
                    </div>
                  </div>

                  {calendarError && (
                    <div className="bk-cal-alert">
                      ⚠️ {calendarError}
                    </div>
                  )}

                  {/* Calendar Top Legend for Slot Availability */}
                  <div className="bk-cal-legend-bar">
                    <div className="bk-legend-item bk-legend-avail">
                      <span className="bk-legend-chip green"></span>
                      <span><strong>Green:</strong> Available (Open)</span>
                    </div>
                    <div className="bk-legend-item bk-legend-booked">
                      <span className="bk-legend-chip red"></span>
                      <span><strong>Red:</strong> Booked (Reserved)</span>
                    </div>
                    <div className="bk-legend-item bk-legend-selected">
                      <span className="bk-legend-chip dark-green"></span>
                      <span><strong>Dark Green:</strong> Selected</span>
                    </div>
                  </div>

                  {/* Calendar 7-Day Grid */}
                  <div className="bk-cal-grid-wrapper">
                    <div className="bk-cal-weekdays-row">
                      <span>SUN</span>
                      <span>MON</span>
                      <span>TUE</span>
                      <span>WED</span>
                      <span>THU</span>
                      <span>FRI</span>
                      <span>SAT</span>
                    </div>

                    <div className="bk-cal-dates-grid">
                      {getCalendarDays(calendarMonth).map((day, idx) => {
                        if (!day) return <div key={`empty-${idx}`} className="bk-date-card bk-empty"></div>;
                        const key = toDateKey(day);
                        const todayStr = toDateKey(new Date());
                        const isPastDate = key < todayStr;
                        const isTodayDate = key === todayStr;
                        const isSelectedDate = startDate === key;
                        const slotData = getSlotData(key);
                        const isDayBooked = slotData.day;
                        const isNightBooked = slotData.night;
                        const isAllDayBooked = isDayBooked || isNightBooked;

                        const isDaySelected = isSelectedDate && selectedSlot === 'AM';
                        const isNightSelected = isSelectedDate && selectedSlot === 'PM';
                        const isAllDaySelected = isSelectedDate && selectedSlot === 'FULL_DAY';

                        return (
                          <div
                            key={key}
                            className={`bk-date-card ${isPastDate ? 'disabled' : ''} ${isSelectedDate ? 'selected-date-card' : ''}`}
                          >
                            <div className="bk-date-card-top">
                              <span className="bk-date-num">{day.getDate()}</span>
                              {isTodayDate && <span className="bk-today-tag">TODAY</span>}
                            </div>

                            <div className="bk-date-slots-group">
                              {/* Day Slot: GREEN if open, RED if booked */}
                              <button
                                type="button"
                                className={`bk-slot-btn day ${isDayBooked ? 'bk-slot-booked' : 'bk-slot-avail'} ${isDaySelected ? 'active-slot' : ''}`}
                                disabled={isPastDate || isDayBooked}
                                onClick={() => handleSlotPick(day, 'AM')}
                                title={isDayBooked ? 'Day Slot is Booked (Unavailable)' : 'Day Slot is Available (09:00 AM - 05:00 PM)'}
                              >
                                <span className="slot-dot-icon">{isDayBooked ? '🔴' : isDaySelected ? '🌟' : '🟢'}</span>
                                <span className="slot-name">Day</span>
                                <span className={`slot-badge-mini ${isDayBooked ? 'red' : 'green'}`}>
                                  {isDayBooked ? 'Booked' : 'Open'}
                                </span>
                              </button>

                              {/* Night Slot: GREEN if open, RED if booked */}
                              <button
                                type="button"
                                className={`bk-slot-btn night ${isNightBooked ? 'bk-slot-booked' : 'bk-slot-avail'} ${isNightSelected ? 'active-slot' : ''}`}
                                disabled={isPastDate || isNightBooked}
                                onClick={() => handleSlotPick(day, 'PM')}
                                title={isNightBooked ? 'Night Slot is Booked (Unavailable)' : 'Night Slot is Available (06:00 PM - 09:00 AM)'}
                              >
                                <span className="slot-dot-icon">{isNightBooked ? '🔴' : isNightSelected ? '🌟' : '🟢'}</span>
                                <span className="slot-name">Night</span>
                                <span className={`slot-badge-mini ${isNightBooked ? 'red' : 'green'}`}>
                                  {isNightBooked ? 'Booked' : 'Open'}
                                </span>
                              </button>

                              {/* All Day 24h: GREEN if both open, RED if either booked */}
                              <button
                                type="button"
                                className={`bk-slot-btn allday ${isAllDayBooked ? 'bk-slot-booked' : 'bk-slot-avail'} ${isAllDaySelected ? 'active-slot' : ''}`}
                                disabled={isPastDate || isAllDayBooked}
                                onClick={() => handleSlotPick(day, 'FULL_DAY')}
                                title={isAllDayBooked ? 'All Day Slot is Unavailable (Conflict)' : 'All Day (Full 24h) is Available'}
                              >
                                <span className="slot-dot-icon">{isAllDayBooked ? '🔴' : isAllDaySelected ? '🌟' : '🟢'}</span>
                                <span className="slot-name">24h All</span>
                                <span className={`slot-badge-mini ${isAllDayBooked ? 'red' : 'green'}`}>
                                  {isAllDayBooked ? 'Booked' : 'Open'}
                                </span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Bottom: Choose Your Slot Type Cards */}
                  <div className="bk-choose-slot-section">
                    <div className="bk-css-head">
                      <div className="bk-css-tag">
                        <span className="bk-css-icon">📅</span> CHOOSE YOUR SLOT TYPE FOR {formatDisplayDate(startDate).toUpperCase()}
                      </div>
                      <h4>Select Day, Night, or All Day to Book Instantly</h4>
                      <p>🟢 Green indicates remaining available slots. 🔴 Red indicates booked slots that cannot be selected.</p>
                    </div>

                    <div className="bk-slot-cards-trio">
                      {/* 1. Day Only */}
                      {(() => {
                        const isDayAvail = isSlotAvailable(startDate, 'AM');
                        return (
                          <div 
                            className={`bk-slot-choice-card ${selectedSlot === 'AM' ? 'active' : ''} ${!isDayAvail ? 'slot-unavailable-red' : 'slot-available-green'}`}
                            onClick={() => {
                              if (!isDayAvail) {
                                setCalendarError(`🔴 Date ${formatDisplayDate(startDate)}: Day Slot is already booked for this farmhouse.`);
                                showToast(`🔴 Day slot is booked! Please choose Night or another date.`);
                                return;
                              }
                              setCalendarError('');
                              setSelectedSlot('AM');
                              setEndDate(startDate);
                              showToast(`🟢 Selected ☀️ Day Only Slot for ${formatDisplayDate(startDate)}!`);
                            }}
                          >
                            <div className="bk-scc-left">
                              <div className="bk-scc-title-row">
                                <span className="bk-scc-sun">☀️</span>
                                <strong>Day Only</strong>
                                {isDayAvail ? (
                                  <span className="bk-scc-badge-green">🟢 Available</span>
                                ) : (
                                  <span className="bk-scc-badge-red">🔴 Already Booked</span>
                                )}
                              </div>
                              <span className="bk-scc-time">09:00 AM - 05:00 PM</span>
                              <div className="bk-scc-price">
                                <strong>₹ {Math.round(rawPricePerNight * 0.60).toLocaleString()}</strong>
                                <span>/ day slot</span>
                              </div>
                            </div>
                            <div className="bk-scc-arrow">{isDayAvail ? '›' : '✕'}</div>
                          </div>
                        );
                      })()}

                      {/* 2. Night Only */}
                      {(() => {
                        const isNightAvail = isSlotAvailable(startDate, 'PM');
                        return (
                          <div 
                            className={`bk-slot-choice-card ${selectedSlot === 'PM' ? 'active' : ''} ${!isNightAvail ? 'slot-unavailable-red' : 'slot-available-green'}`}
                            onClick={() => {
                              if (!isNightAvail) {
                                setCalendarError(`🔴 Date ${formatDisplayDate(startDate)}: Night Slot is already booked for this farmhouse.`);
                                showToast(`🔴 Night slot is booked! Please choose Day or another date.`);
                                return;
                              }
                              setCalendarError('');
                              setSelectedSlot('PM');
                              const nextD = new Date(startDate + 'T00:00:00');
                              nextD.setDate(nextD.getDate() + 1);
                              setEndDate(toDateKey(nextD));
                              showToast(`🟢 Selected 🌙 Night Only Slot for ${formatDisplayDate(startDate)}!`);
                            }}
                          >
                            <div className="bk-scc-left">
                              <div className="bk-scc-title-row">
                                <span className="bk-scc-moon">🌙</span>
                                <strong>Night Only</strong>
                                {isNightAvail ? (
                                  <span className="bk-scc-badge-green">🟢 Available</span>
                                ) : (
                                  <span className="bk-scc-badge-red">🔴 Already Booked</span>
                                )}
                              </div>
                              <span className="bk-scc-time">06:00 PM - 09:00 AM (Next Day)</span>
                              <div className="bk-scc-price">
                                <strong>₹ {Math.round(rawPricePerNight * 0.75).toLocaleString()}</strong>
                                <span>/ night slot</span>
                              </div>
                            </div>
                            <div className="bk-scc-arrow">{isNightAvail ? '›' : '✕'}</div>
                          </div>
                        );
                      })()}

                      {/* 3. All Day (Full 24h) */}
                      {(() => {
                        const isFullAvail = isSlotAvailable(startDate, 'FULL_DAY');
                        return (
                          <div 
                            className={`bk-slot-choice-card ${selectedSlot === 'FULL_DAY' ? 'active' : ''} ${!isFullAvail ? 'slot-unavailable-red' : 'slot-available-green'}`}
                            onClick={() => {
                              if (!isFullAvail) {
                                setCalendarError(`🔴 Date ${formatDisplayDate(startDate)}: All Day 24h stay is unavailable because one or more slots are already booked.`);
                                showToast(`🔴 24h Stay conflict! A slot is already booked on this date.`);
                                return;
                              }
                              setCalendarError('');
                              setSelectedSlot('FULL_DAY');
                              const nextD = new Date(startDate + 'T00:00:00');
                              nextD.setDate(nextD.getDate() + 1);
                              setEndDate(toDateKey(nextD));
                              showToast(`🟢 Selected 🌟 All Day Slot (24h) for ${formatDisplayDate(startDate)}!`);
                            }}
                          >
                            <div className="bk-scc-left">
                              <div className="bk-scc-title-row">
                                <span className="bk-scc-star">🌟</span>
                                <strong>All Day (Full 24h)</strong>
                                {isFullAvail ? (
                                  <span className="bk-scc-badge-green">🟢 Available</span>
                                ) : (
                                  <span className="bk-scc-badge-red">🔴 Conflict (Booked)</span>
                                )}
                              </div>
                              <span className="bk-scc-time">09:00 AM - 09:00 AM (Next Day)</span>
                              <div className="bk-scc-price">
                                <strong>₹ {rawPricePerNight.toLocaleString()}</strong>
                                <span>/ 24h stay</span>
                              </div>
                            </div>
                            <div className="bk-scc-arrow bk-scc-arrow-circle">{isFullAvail ? '›' : '✕'}</div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>

                {/* ── Right Column: Allocations, Manifest & Features ── */}
                <div className="bk-manifest-column-card">
                  {/* Quick Select Standard Allocations Header */}
                  <div className="bk-alloc-header">
                    <span className="bk-alloc-icon">👥</span>
                    <h3>Quick Select Standard Allocations</h3>
                  </div>

                  <div className="bk-alloc-grid-3">
                    {COUPLE_ALLOCATIONS.map(alloc => (
                      <div
                        key={alloc.count}
                        role="button"
                        tabIndex={0}
                        aria-pressed={selectedCoupleCount === alloc.count}
                        className={`bk-alloc-box ${selectedCoupleCount === alloc.count ? 'active' : ''}`}
                        onClick={() => handleSelectCouple(alloc)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            handleSelectCouple(alloc);
                          }
                        }}
                      >
                        <div className="bk-alloc-top-row">
                          <span className="bk-alloc-people-icon">👥</span>
                          {selectedCoupleCount === alloc.count && <span className="bk-alloc-check">✓</span>}
                        </div>
                        <h4>{alloc.label}</h4>
                        <p>{alloc.sub}</p>
                      </div>
                    ))}
                  </div>

                  {/* 3 Value Features */}
                  <div className="bk-features-triplet">
                    <div className="bk-feat-pill-card">
                      <span className="bk-feat-icon">🏠</span>
                      <div>
                        <strong>Private Check-in &amp; Host</strong>
                        <p>Direct concierge greeting on arrival</p>
                      </div>
                    </div>

                    <div className="bk-feat-pill-card">
                      <span className="bk-feat-icon">🏊</span>
                      <div>
                        <strong>Exclusive Pool &amp; Lawn</strong>
                        <p>No shared access with outside guests</p>
                      </div>
                    </div>

                    <div className="bk-feat-pill-card">
                      <span className="bk-feat-icon">🍽️</span>
                      <div>
                        <strong>Farmhouse Breakfast</strong>
                        <p>Fresh estate kitchen morning menu</p>
                      </div>
                    </div>
                  </div>

                  {/* Official Reservation Manifest Container */}
                  <div className="bk-official-manifest-box">
                    <div className="bk-manifest-head">
                      <div>
                        <span className="bk-manifest-title">OFFICIAL RESERVATION MANIFEST</span>
                        <div className="bk-manifest-ref">
                          REF: EST-{selectedSlot}-{selectedCoupleCount}X{selectedCoupleCount * 2}
                        </div>
                      </div>
                      {isOfferActive && appliedOffer && (
                        <div className="bk-manifest-promo-tag">
                          ✓ {appliedOffer.percent}% Promo Applied
                        </div>
                      )}
                    </div>

                    <div className="bk-manifest-2x2">
                      <div className="bk-manifest-cell">
                        <span className="cell-label">BOOKED SLOT</span>
                        <div className="cell-val-row">
                          <span className="cell-icon">☀️</span>
                          <strong>{selectedSlot === 'AM' ? 'Day Only (9AM-5PM)' : selectedSlot === 'PM' ? 'Night Only (6PM-9AM)' : 'All Day (Full 24h)'}</strong>
                        </div>
                      </div>

                      <div className="bk-manifest-cell">
                        <span className="cell-label">TOTAL COUPLES</span>
                        <div className="cell-val-row">
                          <span className="cell-icon">👥</span>
                          <strong>{selectedCoupleCount} Couple{selectedCoupleCount > 1 ? 's' : ''}</strong>
                        </div>
                      </div>

                      <div className="bk-manifest-cell">
                        <span className="cell-label">TOTAL GUEST COUNT</span>
                        <div className="cell-val-row">
                          <span className="cell-icon">👤</span>
                          <strong>{selectedCoupleCount * 2} Registered Adults</strong>
                        </div>
                      </div>

                      <div className="bk-manifest-cell">
                        <span className="cell-label">ACCOMMODATIONS</span>
                        <div className="cell-val-row">
                          <span className="cell-icon">🛏️</span>
                          <strong>{selectedCoupleCount} Private Master Suite{selectedCoupleCount > 1 ? 's' : ''}</strong>
                        </div>
                      </div>
                    </div>

                    <div className="bk-manifest-alert">
                      <span className="alert-shield">🛡️</span>
                      <span>Verified Estate Standard: Guaranteed private premises, sanitized luxury linens, and dedicated caretaker.</span>
                    </div>
                  </div>

                  {/* Step 1 CTA to Step 2 */}
                  <div className="bk-step-1-continue-wrap">
                    <button
                      type="button"
                      className="bk-continue-step2-btn"
                      onClick={handleProceedToStep2}
                    >
                      Continue to Review &amp; Discounts ➔
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════
                STEP 2: OFFERS, PRICE BREAKDOWN & SUMMARY (SCREEN 2)
                ══════════════════════════════════════════ */}
            {currentStep === 2 && (
              <div className="bk-screen-2-grid">
                {/* ── Left Column: Promo Codes & Price Calculation ── */}
                <div className="bk-screen2-left-pane">
                  {/* Special Offers & Promo Codes */}
                  <div className="bk-offers-calc-card">
                    <div className="bk-offers-header-row">
                      <div className="bk-offers-title-group">
                        <span className="bk-percent-icon">%</span>
                        <div>
                          <h3>Special Offers &amp; Promo Codes</h3>
                          <p>Select any active discount below or enter your private promo coupon</p>
                        </div>
                      </div>
                      <Link to="/offers" target="_blank" className="bk-view-all-link">
                        View All Offers ➔
                      </Link>
                    </div>

                    {/* Coupon Input Bar */}
                    <div className="bk-coupon-input-bar">
                      <div className="bk-cib-input-wrap">
                        <span className="bk-cib-tag-icon">🏷️</span>
                        <input
                          type="text"
                          placeholder="Enter promo code"
                          value={inputCouponCode}
                          onChange={e => setInputCouponCode(e.target.value)}
                        />
                      </div>
                      <button
                        type="button"
                        className="bk-cib-apply-btn"
                        onClick={() => handleApplyPromoCode()}
                      >
                        Apply
                      </button>
                    </div>

                    {error && <p className="bk-promo-error-msg">{error}</p>}

                    {/* Active Promo Notification Banner */}
                    {isOfferActive && appliedOffer && (
                      <div className="bk-applied-banner">
                        <div className="bk-ab-left">
                          <span className="bk-ab-check">✓</span>
                          <div className="bk-ab-text">
                            <strong>{appliedOffer.code} ({appliedOffer.percent}% OFF) — {appliedOffer.title}</strong>
                            <p>Deducted - ₹{discountAmount.toLocaleString()} from your reservation total.</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          className="bk-ab-dismiss"
                          onClick={handleRemoveOffer}
                          title="Remove Promo Code"
                        >
                          ✕
                        </button>
                      </div>
                    )}

                    {/* Available Discount Pills */}
                    <div className="bk-avail-discounts-wrap">
                      <span className="bk-ad-title">Available Discounts:</span>
                      <div className="bk-ad-pills-row">
                        {availableOffers.map(offer => {
                          const isSelected = isOfferActive && appliedOffer?.code === offer.code;
                          return (
                            <button
                              key={offer.code}
                              type="button"
                              className={`bk-ad-pill ${isSelected ? 'active' : ''}`}
                              onClick={() => handleApplyPromoCode(offer.code)}
                            >
                              <span className="pill-ico">{offer.icon}</span>
                              <strong>{offer.code} ({offer.percent}% OFF)</strong>
                              {isSelected && <span className="pill-chk">✓</span>}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Price Breakdown & Calculation */}
                  <div className="bk-offers-calc-card bk-price-breakdown-card">
                    <div className="bk-offers-title-group">
                      <span className="bk-percent-icon">%</span>
                      <h3>Price Breakdown &amp; Calculation</h3>
                    </div>

                    <div className="bk-price-table">
                      <div className="bk-pt-row">
                        <div className="bk-pt-label">
                          <span className="pt-icon">☀️</span>
                          <span>{selectedSlot === 'AM' ? 'Day Slot Rate (09:00 AM - 05:00 PM):' : selectedSlot === 'PM' ? 'Night Slot Rate (06:00 PM - 09:00 AM):' : 'All Day Base Rate (24 Hours):'}</span>
                        </div>
                        <span className="bk-pt-val">₹ {basePrice.toLocaleString()}</span>
                      </div>

                      <div className="bk-pt-row">
                        <div className="bk-pt-label">
                          <span className="pt-icon">🌿</span>
                          <span>Subtotal Fare:</span>
                        </div>
                        <span className="bk-pt-val">₹ {subtotal.toLocaleString()}</span>
                      </div>

                      {isOfferActive && appliedOffer && (
                        <div className="bk-pt-row bk-pt-discount-row">
                          <div className="bk-pt-label">
                            <span className="pt-icon">🏷️</span>
                            <span>Discount ({appliedOffer.code} • {appliedOffer.percent}%):</span>
                          </div>
                          <span className="bk-pt-val discount-val">- ₹ {discountAmount.toLocaleString()}</span>
                        </div>
                      )}

                      <div className="bk-pt-divider"></div>

                      <div className="bk-pt-row bk-pt-total-row">
                        <strong>Total Payable:</strong>
                        <strong className="bk-pt-total-val">₹ {grandTotal.toLocaleString()}</strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── Right Column: Sticky Summary Card ── */}
                <div className="bk-screen2-right-pane">
                  <div className="bk-summary-sticky-card">
                    <div className="bk-ssc-image-wrap">
                      <img 
                        src={farmhouse?.imageUrl || 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=1200&auto=format&fit=crop'} 
                        alt={farmhouse?.name} 
                      />
                      <div className="bk-ssc-badge">
                        <span>🛏️</span> {farmhouse?.name || 'Luxury Mountain Villa'}
                      </div>
                    </div>

                    <div className="bk-ssc-content">
                      <div className="bk-ssc-item">
                        <span className="ssc-icon">📅</span>
                        <div className="ssc-text">
                          <span className="ssc-label">Check-in</span>
                          <strong>{formatDisplayDate(startDate)}, {selectedSlot === 'PM' ? '06:00 PM' : '09:00 AM'}</strong>
                        </div>
                      </div>

                      <div className="bk-ssc-item">
                        <span className="ssc-icon">📅</span>
                        <div className="ssc-text">
                          <span className="ssc-label">Check-out</span>
                          <strong>{formatDisplayDate(endDate || startDate)}, {selectedSlot === 'AM' ? '05:00 PM' : '09:00 AM'}</strong>
                        </div>
                      </div>

                      <div className="bk-ssc-item">
                        <span className="ssc-icon">🌙</span>
                        <div className="ssc-text">
                          <span className="ssc-label">Nights</span>
                          <strong>{selectedSlot === 'AM' ? 'Day Slot' : `${nights} Night${nights > 1 ? 's' : ''}`}</strong>
                        </div>
                      </div>

                      <div className="bk-ssc-item">
                        <span className="ssc-icon">👥</span>
                        <div className="ssc-text">
                          <span className="ssc-label">Guests</span>
                          <strong>{selectedCoupleCount * 2} ({selectedCoupleCount} Couple{selectedCoupleCount > 1 ? 's' : ''})</strong>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="bk-btn-continue-addons"
                        onClick={() => setCurrentStep(3)}
                      >
                        Continue to Add-ons ➔
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════
                STEP 3: ADD-ONS & EXPERIENCES CATALOG
                ══════════════════════════════════════════ */}
            {currentStep === 3 && (
              <div className="bk-card-box bk-addons-full-wrapper">
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

                {/* Search & Filter Navigation Tabs */}
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

                {/* Add-ons Catalog Grid */}
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
                        <div className="bk-rac-header">
                          <span className="bk-rac-badge">{addon.badge}</span>
                          <div className="bk-rac-rating">
                            <span>⭐ {addon.rating}</span>
                            <small>({addon.reviewsCount})</small>
                          </div>
                        </div>

                        <div className="bk-rac-main">
                          <span className="bk-rac-icon">{addon.icon}</span>
                          <div>
                            <h4 className="bk-rac-title">{addon.label}</h4>
                            <p className="bk-rac-tagline">{addon.tagline}</p>
                          </div>
                        </div>

                        {isSelected && (
                          <div className="bk-rac-config-panel">
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
                              🔍 View Inclusions
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

                {/* Custom Concierge Requests & Quick Chips */}
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
                    placeholder="E.g. We are celebrating an anniversary. Please arrange chilled glasses and fresh flowers..."
                    value={specialRequests}
                    onChange={e => setSpecialRequests(e.target.value)}
                  ></textarea>
                </div>

                {/* Navigation Buttons */}
                <div className="bk-buttons-split">
                  <button
                    type="button"
                    className="bk-btn-outline"
                    onClick={() => setCurrentStep(2)}
                  >
                    ‹ Back to Offers &amp; Summary
                  </button>
                  <button
                    type="button"
                    className="bk-btn-book-now"
                    onClick={() => setCurrentStep(4)}
                  >
                    <span>Proceed to Payment</span>
                    <span className="arrow">➔</span>
                  </button>
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════
                STEP 4: PAYMENT
                ══════════════════════════════════════════ */}
            {currentStep === 4 && (
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

                <div className="bk-itemized-calc-box">
                  <h4 className="calc-title">Final Verified Reservation Summary</h4>
                  
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

                  {isOfferActive && appliedOffer && (
                    <div className="calc-row calc-discount-row">
                      <span>
                        🏷️ Discount ({appliedOffer.code} • {appliedOffer.percent}% OFF):
                      </span>
                      <strong className="discount-minus">- ₹ {discountAmount.toLocaleString()}</strong>
                    </div>
                  )}

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
                    onClick={() => setCurrentStep(3)}
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

      {/* ── 5. Inclusions Modal ── */}
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
