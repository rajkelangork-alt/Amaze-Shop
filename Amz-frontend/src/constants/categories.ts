export interface ShowcaseItemEdition {
  name: string;
  bundleDescription: string;
  price: number;
}

export interface ShowcaseItem {
  id: string;
  name: string;
  price: number;
  imageFileName: string;
  categoryId: number;
  vendorEmail?: string;
  stockUnits?: number; // <-- Added dynamic stock units
  editions?: ShowcaseItemEdition[];
}

export interface ShowcaseCategory {
  id: number;
  name: string;
  slug?: string;
  tagline: string;
  items: ShowcaseItem[];
}

export const getVendorForProduct = (categoryId: number, itemIndex: number): string => {
  if (categoryId <= 7 || (categoryId === 8 && itemIndex === 0)) {
    return 'vendor.apex@amzshop.com';
  }
  if (categoryId <= 14) {
    return 'vendor.nova@amzshop.com';
  }
  return 'vendor.zenith@amzshop.com';
};

const RAW_SHOWCASE_CATALOG: ShowcaseCategory[] = [
  {
    id: 1,
    name: 'Electronics',
    tagline: 'Up to 40% off | Top tech deals',
    items: [
      { id: 'el-1', name: 'Pro Wireless Noise-Cancelling Headphones', price: 149.99, imageFileName: 'Closed-Back Studio Reference Monitor Headphones', categoryId: 1 },
      { id: 'el-2', name: '4K Ultra HD Smart Streamer', price: 49.99, imageFileName: '4K Ultra HD Smart Streamer', categoryId: 1 },
      { id: 'el-3', name: 'Ergonomic Multi-Device Bluetooth Mouse', price: 29.99, imageFileName: 'Ergonomic Multi-Device Wireless Mouse', categoryId: 1 },
      { id: 'el-4', name: 'Fast Wireless Charging Stand', price: 24.99, imageFileName: 'Fast Wireless Charging Stand 15W', categoryId: 1 },
      { id: 'el-5', name: 'Compact Portable Power Bank 20,000mAh', price: 39.99, imageFileName: 'Compact Power Bank 20000mAh', categoryId: 1 },
    ],
  },
  {
    id: 2,
    name: 'Computers & Accessories',
    tagline: 'Boost your daily productivity',
    items: [
      { id: 'cp-1', name: 'Mechanical RGB Backlit Keyboard', price: 69.99, imageFileName: '61-Key Portable Touch-Response Keyboard', categoryId: 2 },
      { id: 'cp-2', name: 'USB-C Dual HDMI Multi-Port Hub', price: 34.99, imageFileName: 'USB-C Dual HDMI Multiport Hub 7-in-1', categoryId: 2 },
      { id: 'cp-3', name: '1080p FHD Wide-Angle Webcam', price: 44.99, imageFileName: '1080p FHD Wide-Angle Webcam with Privacy Cover', categoryId: 2 },
      { id: 'cp-4', name: 'Adjustable Aluminum Laptop Riser', price: 27.99, imageFileName: 'Adjustable Aluminum Laptop Stand', categoryId: 2 },
      { id: 'cp-5', name: 'Extended Non-Slip Desk Mat', price: 16.99, imageFileName: 'Extended Gaming Mouse Pad XXL Desk Mat', categoryId: 2 },
    ],
  },
  {
    id: 3,
    name: 'Smart Home',
    tagline: 'Connected security, lighting & automation',
    items: [
      { id: 'sh-1', name: 'Wi-Fi Smart Plug Energy Monitor 4-Pack', price: 29.99, imageFileName: 'Wi-Fi Smart Plug 4-Pack Energy Monitoring', categoryId: 3 },
      { id: 'sh-2', name: 'Color Changing RGB+W Smart LED Bulb', price: 17.99, imageFileName: 'Color Changing RGB+W Smart LED Bulb E26', categoryId: 3 },
      { id: 'sh-3', name: 'Wireless Video Doorbell with Two-Way Audio', price: 69.99, imageFileName: 'Wireless Video Doorbell Camera 1080p', categoryId: 3 },
      { id: 'sh-4', name: 'Indoor 1080p Smart Security Camera', price: 34.99, imageFileName: 'Indoor Pan-Tilt Smart Security Camera 2K', categoryId: 3 },
      { id: 'sh-5', name: 'Smart Touchscreen Programmable Thermostat', price: 99.99, imageFileName: 'Smart Wi-Fi Thermostat with Room Sensor', categoryId: 3 },
    ],
  },
  {
    id: 4,
    name: 'Cell Phones & Accessories',
    tagline: 'Everyday mobile essentials',
    items: [
      { id: 'ph-1', name: 'Ultra-Clear 9H Tempered Glass 3-Pack', price: 9.99, imageFileName: 'Ultra-Clear Tempered Glass Screen Protector 3-Pack', categoryId: 4 },
      { id: 'ph-2', name: 'Heavy-Duty Shockproof Protective Case', price: 18.99, imageFileName: 'Heavy-Duty Armor Protective Phone Case', categoryId: 4 },
      { id: 'ph-3', name: 'Magnetic Dashboard Phone Air-Vent Mount', price: 15.99, imageFileName: 'Magnetic Dashboard Car Phone Mount', categoryId: 4 },
      { id: 'ph-4', name: 'Nylon Braided USB-C Fast Cable 2-Pack', price: 12.99, imageFileName: 'Nylon Braided USB-C Fast Charging Cable 2-Pack', categoryId: 4 },
      { id: 'ph-5', name: '30W GaN Mini Wall Fast Charger', price: 19.99, imageFileName: '30W GaN Fast Wall Charger Block', categoryId: 4 },
    ],
  },
  {
    id: 5,
    name: 'Video Games',
    tagline: 'Gear up for pure immersion',
    items: [
      { id: 'vg-1', name: 'Wireless Low-Latency Gaming Controller', price: 54.99, imageFileName: 'Wireless Bluetooth Gaming Controller with Hall Triggers', categoryId: 5 },
      { id: 'vg-2', name: '7.1 Surround Sound Gaming Headset', price: 49.99, imageFileName: '7.1 Surround Sound Gaming Headset with Noise-Cancelling Mic', categoryId: 5 },
      { id: 'vg-3', name: 'RGB Headphone Stand with USB Ports', price: 22.99, imageFileName: 'RGB Headphone Stand with 3-Port USB Hub', categoryId: 5 },
      { id: 'vg-4', name: 'High-Precision Lightweight Gaming Mouse', price: 39.99, imageFileName: 'Ergonomic Multi-Device Wireless Mouse', categoryId: 5 },
      { id: 'vg-5', name: 'Dual Controller Fast Charging Dock', price: 19.99, imageFileName: 'Dual Controller Fast Charging Station Dock', categoryId: 5 },
    ],
  },
  {
    id: 6,
    name: 'Camera & Photo',
    tagline: 'Capture vivid moments easily',
    items: [
      { id: 'cm-1', name: '10-inch Selfie Ring Light with Tripod', price: 29.99, imageFileName: '10-inch LED Selfie Ring Light with Tripod Stand', categoryId: 6 },
      { id: 'cm-2', name: 'Waterproof 4K Action Camera Kit', price: 79.99, imageFileName: 'Waterproof 4K Action Camera with Dual Screens', categoryId: 6 },
      { id: 'cm-3', name: 'Flexible Portable Gorilla Tripod', price: 18.99, imageFileName: 'Flexible All-Terrain Tripod with Ball Head', categoryId: 6 },
      { id: 'cm-4', name: '128GB High-Speed UHS-I SD Card', price: 21.99, imageFileName: '128GB High-Speed UHS-I MicroSDXC Card', categoryId: 6 },
      { id: 'cm-5', name: 'Lens Cleaning & Maintenance Pen Kit', price: 11.99, imageFileName: 'Professional Camera Lens Cleaning Kit', categoryId: 6 },
    ],
  },
  {
    id: 7,
    name: 'Automotive',
    tagline: 'Smart tools for every vehicle',
    items: [
      { id: 'au-1', name: 'Digital Tire Pressure Gauge & Inflator', price: 39.99, imageFileName: 'Digital Tire Pressure Gauge & Inflator', categoryId: 7 },
      { id: 'au-2', name: '1080p Front & Rear Dual Dash Cam', price: 64.99, imageFileName: '1080p Dual Dash Cam Front and Inside Cabin', categoryId: 7 },
      { id: 'au-3', name: '1000A Peak Battery Jump Starter', price: 69.99, imageFileName: '1000A Peak Portable Car Battery Jump Starter', categoryId: 7 },
      { id: 'au-4', name: 'Compact Car Vacuum Cleaner Cordless', price: 32.99, imageFileName: 'Compact Car Vacuum Cleaner Cordless', categoryId: 7 },
      { id: 'au-5', name: 'Bluetooth 5.3 FM Radio Car Transmitter', price: 14.99, imageFileName: 'Bluetooth 5.3 FM Transmitter Car Adapter', categoryId: 7 },
    ],
  },
  {
    id: 8,
    name: 'Home & Kitchen',
    tagline: 'Modern cookery & dining',
    items: [
      { id: 'hk-1', name: 'Digital Touchscreen 5.8-Quart Air Fryer', price: 89.99, imageFileName: 'Digital Touchscreen 5.8-Quart Air Fryer', categoryId: 8 },
      { id: 'hk-2', name: 'Stainless Steel Programmable Coffee Maker', price: 59.99, imageFileName: 'Stainless Steel 12-Cup Programmable Coffee Maker', categoryId: 8 },
      { id: 'hk-3', name: 'Automatic Immersion Sous Vide Precision Cooker', price: 79.99, imageFileName: 'Automatic Immersion Sous Vide Precision Cooker', categoryId: 8 },
      { id: 'hk-4', name: 'Electric Salt and Pepper Grinder Set', price: 24.99, imageFileName: 'Gravity Electric Salt and Pepper Grinder Set', categoryId: 8 },
      { id: 'hk-5', name: 'Stackable Airtight Food Storage Containers', price: 31.99, imageFileName: 'Stackable Airtight Food Storage Container Set 7-Piece', categoryId: 8 },
    ],
  },
  {
    id: 9,
    name: 'Kitchen Appliances',
    tagline: 'Fast cooking precision tools',
    items: [
      { id: 'ka-1', name: '2-Slice Stainless Steel Wide-Slot Toaster', price: 29.99, imageFileName: '2-Slice Stainless Steel Wide-Slot Toaster', categoryId: 9 },
      { id: 'ka-2', name: 'Multi-Function Pressure Cooker 6-Qt', price: 99.99, imageFileName: 'Electric Multi-Function Pressure Cooker 6-Quart', categoryId: 9 },
      { id: 'ka-3', name: 'High-Speed Personal Smoothie Blender', price: 39.99, imageFileName: 'High-Speed Personal Bullet Blender with To-Go Cups', categoryId: 9 },
      { id: 'ka-4', name: 'Rapid Electric Glass Water Kettle', price: 27.99, imageFileName: 'Rapid Boil Electric Glass Kettle 1.7L', categoryId: 9 },
      { id: 'ka-5', name: 'Immersion Hand Blender with Whisk Attachment', price: 34.99, imageFileName: '4-in-1 Variable Speed Immersion Hand Blender', categoryId: 9 },
    ],
  },
  {
    id: 10,
    name: 'Fashion & Apparel',
    tagline: 'Timeless styles for every season',
    items: [
      { id: 'fa-1', name: 'Classic Tailored Oxford Shirt', price: 34.99, imageFileName: 'Classic Tailored Oxford Shirt', categoryId: 10 },
      { id: 'fa-2', name: 'Classic Mesh Stainless Steel Watch', price: 59.99, imageFileName: 'Classic Mesh Stainless Steel Watch', categoryId: 10 },
      { id: 'fa-3', name: '14K Gold-Plated Dainty Herringbone Chain', price: 24.99, imageFileName: '14K Gold-Plated Dainty Herringbone Chain', categoryId: 10 },
      { id: 'fa-4', name: 'Polarized UV400 Classic Sunglasses', price: 18.99, imageFileName: 'Polarized Vintage Wayfarer Sunglasses UV400', categoryId: 10 },
      { id: 'fa-5', name: 'RFID-Blocking Slim Genuine Leather Wallet', price: 22.99, imageFileName: 'Minimalist Slim RFID Bifold Leather Wallet', categoryId: 10 },
    ],
  },
  {
    id: 11,
    name: 'Beauty & Personal Care',
    tagline: 'Daily glow and body essentials',
    items: [
      { id: 'bp-1', name: 'Sonic Rechargeable Electric Toothbrush', price: 39.99, imageFileName: 'Sonic Electric Toothbrush with 8 Brush Heads', categoryId: 11 },
      { id: 'bp-2', name: 'Pure Vitamin C Brightening Facial Serum', price: 18.99, imageFileName: 'Vitamin C + Hyaluronic Acid Facial Serum 30ml', categoryId: 11 },
      { id: 'bp-3', name: 'Ionic Salon Fast-Drying Hair Dryer', price: 44.99, imageFileName: 'Professional Negative Ionic Hair Dryer 1875W', categoryId: 11 },
      { id: 'bp-4', name: 'All-in-One Cordless Beard Trimmer Groomer', price: 32.99, imageFileName: 'Waterproof Cordless Beard and Hair Trimmer Kit', categoryId: 11 },
      { id: 'bp-5', name: 'Natural Mineral Dead Sea Mud Mask', price: 14.99, imageFileName: 'Dead Sea Mud Mask for Face and Body 250g', categoryId: 11 },
    ],
  },
  {
    id: 12,
    name: 'Health & Household',
    tagline: 'Wellness and spotless living',
    items: [
      { id: 'hh-1', name: 'Deep Tissue Percussion Massage Gun', price: 49.99, imageFileName: 'Deep Tissue Percussion Massage Gun', categoryId: 12 },
      { id: 'hh-2', name: 'Digital Body Composition Smart Scale', price: 24.99, imageFileName: 'Digital Body Composition Smart Scale', categoryId: 12 },
      { id: 'hh-3', name: 'Blood Pressure Monitor Arm Cuff', price: 36.99, imageFileName: 'Blood Pressure Monitor Arm Cuff', categoryId: 12 },
      { id: 'hh-4', name: 'H13 True HEPA Air Purifier for Bedroom', price: 69.99, imageFileName: 'H13 True HEPA Air Purifier for Bedroom', categoryId: 12 },
      { id: 'hh-5', name: 'Ultra-Quiet Cool Mist Humidifier 4.5L', price: 29.99, imageFileName: 'Ultra-Quiet Ultrasonic Cool Mist Humidifier 4.5L', categoryId: 12 },
    ],
  },
  {
    id: 13,
    name: 'Books & Literature',
    tagline: 'Bestselling titles & lifelong wisdom',
    items: [
      { id: 'bk-1', name: 'Atomic Habits by James Clear', price: 14.99, imageFileName: 'Atomic Habits by James Clear', categoryId: 13 },
      { id: 'bk-2', name: 'Deep Work by Cal Newport', price: 15.99, imageFileName: 'Deep Work by Cal Newport', categoryId: 13 },
      { id: 'bk-3', name: 'Single-Origin Whole Bean Arabica Coffee', price: 16.99, imageFileName: 'Single-Origin Whole Bean Coffee 12oz', categoryId: 13 },
      { id: 'bk-4', name: '100% Pure Raw Wildflower Honey', price: 13.99, imageFileName: 'Raw Unfiltered Clover Honey 16oz', categoryId: 13 },
      { id: 'bk-5', name: 'Organic Cold-Pressed Extra Virgin Olive Oil', price: 18.99, imageFileName: 'Organic Extra Virgin Olive Oil 500ml', categoryId: 13 },
    ],
  },
  {
    id: 14,
    name: 'Toys & Games',
    tagline: 'Creative fun for children & families',
    items: [
      { id: 'tg-1', name: '1000-Piece Landscape Art Jigsaw Puzzle', price: 19.99, imageFileName: '1000-Piece Landscape Art Jigsaw Puzzle', categoryId: 14 },
      { id: 'tg-2', name: 'Classic Wooden Strategic Chess Set', price: 27.99, imageFileName: 'Classic Wooden Strategic Chess Set', categoryId: 14 },
      { id: 'tg-3', name: 'Educational STEM Robotic Building Kit', price: 39.99, imageFileName: 'Educational STEM Robotic Building Kit', categoryId: 14 },
      { id: 'tg-4', name: 'Magnetic 3D Geometry Building Tiles', price: 29.99, imageFileName: '100-Piece Magnetic Building Tiles Set', categoryId: 14 },
      { id: 'tg-5', name: '48-Color Dual Tip Artist Sketch Markers', price: 24.99, imageFileName: '48-Color Dual Tip Artist Sketch Markers', categoryId: 14 },
    ],
  },
  {
    id: 15,
    name: 'Baby Products',
    tagline: 'Comfort and care for your little ones',
    items: [
      { id: 'bb-1', name: 'Wireless Video Baby Monitor 5-inch Screen', price: 69.99, imageFileName: 'Video Baby Monitor with 5-inch Display and Night Vision', categoryId: 15 },
      { id: 'bb-2', name: 'Ergonomic 4-in-1 Baby Carrier Wrap', price: 42.99, imageFileName: 'Ergonomic 4-in-1 Baby Carrier with Lumbar Support', categoryId: 15 },
      { id: 'bb-3', name: 'Organic Muslin Swaddle Blankets 3-Pack', price: 19.99, imageFileName: 'Organic Cotton Swaddle Blankets 3-Pack', categoryId: 15 },
      { id: 'bb-4', name: 'White Noise Sound Machine with Night Light', price: 24.99, imageFileName: 'White Noise Sound Machine with Soothing Sounds', categoryId: 15 },
      { id: 'bb-5', name: 'Fast Steam Baby Bottle Warmer', price: 34.99, imageFileName: 'Fast Electric Baby Bottle Warmer & Sterilizer', categoryId: 15 },
    ],
  },
  {
    id: 16,
    name: 'Sports & Outdoors',
    tagline: 'Fitness, camping & outdoor adventure',
    items: [
      { id: 'so-1', name: 'Adjustable Dumbbell Quick-Set', price: 119.99, imageFileName: 'Adjustable Dumbbell Quick-Set', categoryId: 16 },
      { id: 'so-2', name: 'Anti-Slip Eco-Friendly Yoga Mat', price: 26.99, imageFileName: 'Anti-Slip Eco-Friendly Yoga Mat', categoryId: 16 },
      { id: 'so-3', name: 'Double-Walled Insulated Water Bottle', price: 22.99, imageFileName: 'Double-Walled Insulated Water Bottle', categoryId: 16 },
      { id: 'so-4', name: 'Resistance Exercise Bands Set 5-Pack', price: 19.99, imageFileName: 'Resistance Exercise Loop Bands Set of 5', categoryId: 16 },
      { id: 'so-5', name: 'Acoustic Concert Soprano Ukulele Kit', price: 49.99, imageFileName: 'Acoustic Concert Soprano Ukulele Kit', categoryId: 16 },
    ],
  },
  {
    id: 17,
    name: 'Tools & Home Improvement',
    tagline: 'Durable gear for building and repairs',
    items: [
      { id: 'th-1', name: 'Clip-On Vibration Digital Guitar Tuner', price: 14.99, imageFileName: 'Clip-On Vibration Digital Guitar Tuner', categoryId: 17 },
      { id: 'th-2', name: 'Dimmable LED Minimalist Floor Lamp', price: 49.99, imageFileName: 'Dimmable LED Minimalist Floor Lamp', categoryId: 17 },
      { id: 'th-3', name: '20V Cordless Brushless Drill Driver Kit', price: 79.99, imageFileName: '20V Max Cordless Drill Driver Kit with Battery', categoryId: 17 },
      { id: 'th-4', name: '148-Piece Household Tool Kit with Toolbox', price: 44.99, imageFileName: '148-Piece General Household Tool Repair Set', categoryId: 17 },
      { id: 'th-5', name: 'Self-Leveling Cross-Line Laser Level', price: 49.99, imageFileName: 'Self-Leveling 360 Cross-Line Laser Level', categoryId: 17 },
    ],
  },
  {
    id: 18,
    name: 'Pet Supplies',
    tagline: 'Pawsome comfort, nutrition & play',
    items: [
      { id: 'ps-1', name: 'Orthopedic Memory Foam Pet Dog Bed', price: 49.99, imageFileName: 'Orthopedic Memory Foam Bolster Dog Bed', categoryId: 18 },
      { id: 'ps-2', name: 'Ultra-Quiet Automatic Pet Fountain 2.5L', price: 27.99, imageFileName: 'Ultra-Quiet Stainless Steel Pet Fountain 2.5L', categoryId: 18 },
      { id: 'ps-3', name: 'Self-Cleaning Slicker Brush for Shedding', price: 14.99, imageFileName: 'Self-Cleaning Slicker Grooming Brush', categoryId: 18 },
      { id: 'ps-4', name: 'Interactive Laser & Feather Cat Toy', price: 18.99, imageFileName: 'Automatic Interactive Laser Cat Toy 360', categoryId: 18 },
      { id: 'ps-5', name: 'Tough Natural Rubber Chew Toy', price: 16.99, imageFileName: 'Durable Natural Rubber Chew Toy for Aggressive Chewers', categoryId: 18 },
    ],
  },
  {
    id: 19,
    name: 'Office Products',
    tagline: 'Stationery & desk organization',
    items: [
      { id: 'op-1', name: 'Hardcover Dotted Grid Journal Notebook', price: 13.99, imageFileName: 'Hardcover Dotted Grid Notebook A5', categoryId: 19 },
      { id: 'op-2', name: 'Gel Ink Retractable Rollerball Pens 12-Pack', price: 11.99, imageFileName: 'Retractable Black Gel Ink Pens 0.5mm 12-Pack', categoryId: 19 },
      { id: 'op-3', name: 'Mesh Desk Organizer with Slide Drawer', price: 19.99, imageFileName: 'All-in-One Metal Mesh Desk Organizer with Drawer', categoryId: 19 },
      { id: 'op-4', name: 'Cross-Cut High-Security Paper Shredder', price: 49.99, imageFileName: '6-Sheet Cross-Cut Home Paper Shredder', categoryId: 19 },
      { id: 'op-5', name: 'Memory Foam Keyboard & Mouse Wrist Rest', price: 15.99, imageFileName: 'Ergonomic Memory Foam Keyboard Wrist Rest Pad', categoryId: 19 },
    ],
  },
  {
    id: 20,
    name: 'Garden & Outdoors',
    tagline: 'Lawn care, planting & outdoor living',
    items: [
      { id: 'gt-1', name: 'Bypass Pruning Shears Titanium Blade', price: 16.99, imageFileName: 'Bypass Pruning Shears Titanium Blade', categoryId: 20 },
      { id: 'gt-2', name: 'Ceramic Indoor Planter with Stand', price: 29.99, imageFileName: 'Ceramic Indoor Planter with Stand', categoryId: 20 },
      { id: 'gt-3', name: 'Solar Warm-White Waterproof Path Lights 6-Pack', price: 29.99, imageFileName: 'Outdoor Solar LED Pathway Lights 6-Pack', categoryId: 20 },
      { id: 'gt-4', name: '3-Piece Heavy-Duty Aluminum Garden Tools', price: 19.99, imageFileName: 'Ergonomic 3-Piece Heavy-Duty Garden Tool Set', categoryId: 20 },
      { id: 'gt-5', name: 'Heavy-Duty Padded Grip Gardening Gloves', price: 12.99, imageFileName: 'Thorn-Proof Leather Gardening Work Gloves', categoryId: 20 },
    ],
  },
];

export const SHOWCASE_CATALOG: ShowcaseCategory[] = RAW_SHOWCASE_CATALOG.map((cat) => ({
  ...cat,
  slug: cat.slug || cat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
  items: cat.items.map((item, idx) => ({
    ...item,
    vendorEmail: getVendorForProduct(cat.id, idx),
  })),
}));