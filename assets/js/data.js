/* Picasso Intelligence — store data.
   Titles and prices come from store.cubemars.com/products.json.
   Verify every price before launch — they move. */

window.SITE = {
  brand: "Picasso Intelligence",
  tagline: "",
  announce: ["USA-based team", "Technical support", "Turnkey solution"],
  phone: "(555) 018-4420",
  phoneHref: "tel:+15550184420",
  email: "sales@picassoai.com",
  location: "New York",
  linkedin: "#",
  year: 2026,
  /* $ threshold above which ACH is promoted as the cheaper option */
  achThreshold: 1000
};

/* Nav is built from these. `parent: "actuators"` puts an entry in the
   Actuators dropdown; anything else becomes a top-level item. */
window.COLLECTIONS = [
  {
    id: "integrated", name: "Integrated Actuators", parent: "actuators", art: "actuator",
    tease: "Motor, gearbox, encoder, driver",
    blurb: "Complete joints with motor, planetary reducer, encoder, and driver in one housing.",
    long: "Everything needed to drive a joint, in one housing. AK covers the widest range of ratios and frame sizes, AKE trades a little range for lower backlash and higher torque density, AKA is built for high radial load, and AKH runs the cable straight through a hollow output shaft."
  },
  {
    id: "frameless", name: "Frameless Motors", parent: "actuators", art: "frameless",
    tease: "Rotor + stator sets",
    blurb: "Rotor and stator sets with no housing, for teams designing their own actuator.",
    long: "Frameless sets ship as a matched rotor and stator with no housing, bearings, or shaft, so the actuator geometry is entirely yours. RI inrunner sets suit long, slim joints; RO outrunner sets suit short, wide pancake designs."
  },
  {
    id: "gimbal", name: "Gimbal Motors", parent: "actuators", art: "gimbal",
    tease: "Low cogging, direct drive",
    blurb: "Low-cogging direct-drive motors for stabilisers, scanning heads, and sensor pods.",
    long: "High pole count and a large hollow centre, tuned so the motor holds position smoothly at near-zero speed. Standard picks for camera stabilisers, lidar and radar heads, and any pod that must stay pointed while the vehicle under it does not."
  },
  {
    id: "accessories", name: "Accessories", parent: "actuators", art: "accessory",
    tease: "Drivers, adapters, links",
    blurb: "Driver boards, CAN adapters, and configuration links for the actuators we carry.",
    long: "The small parts that hold up a build: standalone driver boards for each actuator series, USB-to-CAN links for configuration and tuning, and the cabling that connects them."
  }

];

/* The second way into the catalogue: what you are building, rather than
   which series it belongs to. A model can sit in more than one. */
/* The second way into the catalogue: what you are building, rather than
   which series it belongs to. A model can sit in more than one. */
window.APPLICATIONS = [
  {
    id: "humanoid", name: "Humanoid Robots", art: "actuator",
    blurb: "Joint modules from wrist to hip. Distal joints are chosen on weight, proximal joints on torque.",
    products: [
      "ak40-10-kv170", "ak40-10-v3-0-kv170", "ak45-10-kv75",
      "ak45-10-v3-0-kv75", "ak45-36-kv80", "ak45-36-v3-0-kv80",
      "ak70-9-v3-0-kv60", "ak80-9-v3-0-kv100", "ak60-39-v3-0",
      "ak10-9-v3-0-kv60", "ak10-9-v2-0-kv60", "ak80-64-kv80",
      "akh70-16-v1-0-kv41", "akh70-48-v1-0-kv41"
    ]
  },
  {
    id: "exoskeleton", name: "Exoskeletons", art: "actuator",
    blurb: "Backdrivable joints at low reduction, where the wearer has to be able to push the actuator around.",
    products: [
      "ak10-9-v3-0-kv60", "ak10-9-v2-0-kv60", "ak80-9-v3-0-kv100",
      "ak80-9-kv100", "ak80-8-kv60", "ak80-64-kv80",
      "ake60-8-kv80", "ake80-8-kv30", "ake90-8-kv35"
    ]
  },
  {
    id: "quadruped", name: "Quadruped Robots", art: "actuator",
    blurb: "High peak torque with enough transparency to run a torque loop on the leg.",
    products: [
      "ak10-9-v3-0-kv60", "ak10-9-v2-0-kv60", "ak80-9-v3-0-kv100",
      "ak80-9-kv100", "ak80-8-kv60", "ak80-64-kv80",
      "ak70-9-v3-0-kv60", "ak70-9-kv60", "ak70-10-kv100",
      "ak60-39-v3-0"
    ]
  },
  {
    id: "cobot-medical", name: "Cobot and Medical Arms", art: "hollow",
    blurb: "Low backlash and hollow output shafts, so power and CAN run inside the arm instead of around it.",
    products: [
      "akh70-16-v1-0-kv41", "akh70-48-v1-0-kv41", "ake60-8-kv80",
      "ake80-8-kv30", "ake90-8-kv35", "ak10-9-v3-0-kv60",
      "ri20-kv600", "ri30-kv260", "ri50-kv100",
      "ri60-kv120", "ri70-kv95", "ri80-v2-0-kv75",
      "ri100-kv105", "ri75-ph-kv70", "ri85-ph-kv85",
      "ri115-ph-kv40"
    ]
  },
  {
    id: "agv", name: "Wheeled Robots and AGVs", art: "actuator",
    blurb: "Built for the radial load a driven wheel puts on the output bearing.",
    products: [
      "aka60-6-kv80", "aka10-9-kv60", "ak60-6-v3-0-kv80",
      "ak60-6-v1-1-kv140", "ak70-10-kv100", "ak80-8-kv60"
    ]
  },
  {
    id: "gimbal-system", name: "Gimbals and Sensor Pods", art: "gimbal",
    blurb: "Direct drive with low cogging, so the pod holds its aim at near-zero speed.",
    products: [
      "gl30-kv290", "gl35-kv100", "gl40-kv70",
      "gl40-kv82-5", "gl60-kv25", "gl60-kv28",
      "gl80-kv30", "gl80-kv60", "gl100-kv10",
      "ro40-kv140-lite", "ro50-kv108-lite", "ro60-kv115",
      "ro80-kv105", "ro100-kv55"
    ]
  }
];

window.PRODUCTS = [
  { id: "ak40-10-kv170", name: "AK40-10 KV170", brand: "CubeMars", series: "AK Series", collection: "integrated", art: "actuator", size: 0.84, price: 99.9,
    blurb: "",
    specs: { "Reduction Ratio": "10:1", "Rated Torque (N·m)": "1.3", "OD (mm)": "53", "Weight (g)": "200", "Peak Torque (N·m)": "4.1", "Rated Voltage (V)": "24", "Rated Speed (RPM)": "370", "No-Load Speed (RPM)": "435", "Rated Current (A)": "2.7", "Peak Current (A)": "7.3", "Maximum Torque Density (N·m/kg)": "20.5", "Height (mm)": "37", "Backlash (arcmin)": "18", "Kv (RPM/V)": "170", "Kt (N·m/A)": "0.056", "Ke (V/kRPM)": "5.88", "Phase to Phase Resistance (mΩ)": "978", "Phase to Phase Inductance (μH)": "465", "Rotor Inertia (g·cm²)": "540", "Motor Constant (N·m/√W)": "0.0568", "Mechanical Time Constant (ms)": "2.2", "Pole Pairs": "14", "Number of Slots": "24", "Winding Type": "Delta", "Number of Encoder": "1", "Inner Loop Encoder Type": "Magnetic Encoder", "Inner Ring Encoder Resolution": "14bit", "CAN Connector": "A1257WR-S-3P", "UART Connector": "A1257WR-S-3P", "Power Connector": "XT30PW-M", "Temperature Sensor": "NTC MF51B 103F3950", "Noise dB (65cm away the motor)": "50", "Basic Dynamic Load Rating Cr (N)": "2810", "Basic Static Load Rating C0r (N)": "2760", "Operation Ambient Temperature": "-20℃~50℃", "Insulation Level": "C", "Driving Way": "FOC", "Application": "Legged Robot, Exoskeleton, AGV" } },
  { id: "ak45-10-kv75", name: "AK45-10 KV75", brand: "CubeMars", series: "AK Series", collection: "integrated", art: "actuator", size: 0.87, price: 119.9,
    blurb: "",
    specs: { "Reduction Ratio": "10:1", "Rated Torque (N·m)": "2.5", "OD (mm)": "53", "Weight (g)": "260", "Peak Torque (N·m)": "7", "Rated Voltage (V)": "24", "Rated Speed (RPM)": "150", "No-Load Speed (RPM)": "180", "Rated Current (A)": "2.1", "Peak Current (A)": "5", "Maximum Torque Density (N·m/kg)": "26.9", "Height (mm)": "43", "Backlash (arcmin)": "18", "Kv (RPM/V)": "75", "Kt (N·m/A)": "0.127", "Ke (V/kRPM)": "13.33", "Phase to Phase Resistance (mΩ)": "2200", "Phase to Phase Inductance (μH)": "1330", "Rotor Inertia (g·cm²)": "89", "Motor Constant (N·m/√W)": "0.0858", "Mechanical Time Constant (ms)": "0.6", "Pole Pairs": "14", "Number of Slots": "24", "Winding Type": "Delta", "Number of Encoder": "1", "Inner Loop Encoder Type": "Magnetic Encoder", "Inner Ring Encoder Resolution": "14bit", "CAN Connector": "A1257WR-S-3P", "UART Connector": "A1257WR-S-3P", "Power Connector": "XT30PW-M", "Temperature Sensor": "NTC MF51B 103F3950", "Noise dB (65cm away the motor)": "60", "Basic Dynamic Load Rating Cr (N)": "2810", "Basic Static Load Rating C0r (N)": "2760", "Operation Ambient Temperature": "-20℃~50℃", "Insulation Level": "C", "Driving Way": "FOC", "Application": "Legged Robot, Exoskeleton, AGV" } },
  { id: "ak40-10-v3-0-kv170", name: "AK40-10 V3.0 KV170", brand: "CubeMars", series: "AK Series", collection: "integrated", art: "actuator", size: 0.84, price: 135.9,
    blurb: "",
    specs: { "Reduction Ratio": "10:1", "Rated Torque (N·m)": "1.3", "OD (mm)": "53", "Weight (g)": "190", "Peak Torque (N·m)": "4.1", "Rated Voltage (V)": "24", "Rated Speed (RPM)": "370", "No-Load Speed (RPM)": "435", "Rated Current (A)": "2.7", "Peak Current (A)": "7.3", "Maximum Torque Density (N·m/kg)": "20.5", "Height (mm)": "40.2", "Backlash (arcmin)": "18", "Back Drive (N·m)": "0.06", "Kv (RPM/V)": "170", "Kt (N·m/A)": "0.056", "Ke (V/kRPM)": "5.88", "Phase to Phase Resistance (mΩ)": "978", "Phase to Phase Inductance (μH)": "465", "Rotor Inertia (g·cm²)": "97.35", "Motor Constant (N·m/√W)": "0.0568", "Pole Pairs": "14", "Number of Slots": "24", "Number of Encoder": "2", "Inner Loop Encoder Type": "Magnetic Encoder MT6835", "Inner Ring Encoder Resolution": "16bit", "Outer Ring Encoder Type": "Magnetic Encoder MT6835", "Outer Ring Encoder Resolution": "16bit", "Communication Method": "CAN", "CAN Connector": "XT30PW (2+2) -M", "UART Connector": "A1257WR-S-3P", "Temperature Sensor": "NTC MF51B 103F3950", "Noise dB (65cm away the motor)": "50", "Basic Dynamic Load Rating Cr (N)": "2810", "Basic Static Load Rating C0r (N)": "2760", "Operation Ambient Temperature": "-20℃~50℃", "Insulation Level": "C", "Driving Way": "FOC", "Application": "Legged Robot, Exoskeleton, AGV" } },
  { id: "ak45-10-v3-0-kv75", name: "AK45-10 V3.0 KV75", brand: "CubeMars", series: "AK Series", collection: "integrated", art: "actuator", size: 0.87, price: 155.9,
    blurb: "",
    specs: { "Reduction Ratio": "10:1", "Rated Torque (N·m)": "2.5", "OD (mm)": "53", "Weight (g)": "262", "Peak Torque (N·m)": "7", "Rated Voltage (V)": "24", "Rated Speed (RPM)": "120", "No-Load Speed (RPM)": "180", "Rated Current (A)": "1.9", "Peak Current (A)": "5", "Maximum Torque Density (N·m/kg)": "26.9", "Height (mm)": "45.2", "Backlash (arcmin)": "18", "Back Drive (N·m)": "0.1", "Kv (RPM/V)": "75", "Kt (N·m/A)": "0.127", "Ke (V/kRPM)": "13.33", "Phase to Phase Resistance (mΩ)": "2200", "Phase to Phase Inductance (μH)": "1330", "Rotor Inertia (g·cm²)": "157.33", "Motor Constant (N·m/√W)": "0.0858", "Pole Pairs": "14", "Number of Slots": "24", "Number of Encoder": "2", "Inner Loop Encoder Type": "Magnetic Encoder MT6835", "Inner Ring Encoder Resolution": "16bit", "Outer Ring Encoder Type": "Magnetic Encoder MT6835", "Outer Ring Encoder Resolution": "16bit", "Communication Method": "CAN", "CAN Connector": "XT30PW (2+2) -M", "UART Connector": "A1257WR-S-3P", "Temperature Sensor": "NTC MF51B 103F3950", "Noise dB (65cm away the motor)": "50", "Basic Dynamic Load Rating Cr (N)": "2810", "Basic Static Load Rating C0r (N)": "2760", "Operation Ambient Temperature": "-20℃~50℃", "Insulation Level": "C", "Driving Way": "FOC", "Application": "Legged Robot, Exoskeleton, AGV" } },
  { id: "ak45-36-v3-0-kv80", name: "AK45-36 V3.0 KV80", brand: "CubeMars", series: "AK Series", collection: "integrated", art: "actuator", size: 0.87, price: 185.9,
    blurb: "",
    specs: { "Reduction Ratio": "36:1", "Rated Torque (N·m)": "8", "OD (mm)": "55", "Weight (g)": "349", "Peak Torque (N·m)": "24", "Rated Voltage (V)": "24", "Rated Speed (RPM)": "40", "No-Load Speed (RPM)": "52", "Rated Current (A)": "2", "Peak Current (A)": "6.5", "Maximum Torque Density (N·m/kg)": "70.5", "Height (mm)": "56.5", "Backlash (arcmin)": "12", "Back Drive (N·m)": "0.8", "Kv (RPM/V)": "80", "Kt (N·m/A)": "0.11", "Ke (V/kRPM)": "12.5", "Phase to Phase Resistance (mΩ)": "1800", "Phase to Phase Inductance (μH)": "1100", "Rotor Inertia (g·cm²)": "181.9", "Motor Constant (N·m/√W)": "0.15", "Pole Pairs": "14", "Number of Slots": "24", "Number of Encoder": "2", "Inner Loop Encoder Type": "Magnetic Encoder MT6835", "Inner Ring Encoder Resolution": "16bit", "Outer Ring Encoder Type": "Magnetic Encoder MT6835", "Outer Ring Encoder Resolution": "16bit", "Communication Method": "CAN", "CAN Connector": "XT30PW (2+2) -M", "UART Connector": "A1257WR-S-3P", "Temperature Sensor": "NTC MF51B 103F3950", "Noise dB (65cm away the motor)": "50", "Basic Dynamic Load Rating Cr (N)": "2810", "Basic Static Load Rating C0r (N)": "2760", "Operation Ambient Temperature": "-20℃~50℃", "Insulation Level": "C", "Driving Way": "FOC", "Application": "Legged Robot, Exoskeleton, AGV" } },
  { id: "ak45-36-kv80", name: "AK45-36 KV80", brand: "CubeMars", series: "AK Series", collection: "integrated", art: "actuator", size: 0.87, price: 185.9,
    blurb: "",
    specs: { "Reduction Ratio": "36:1", "Rated Torque (N·m)": "8", "OD (mm)": "55", "Weight (g)": "340", "Peak Torque (N·m)": "24", "Rated Voltage (V)": "24", "Rated Speed (RPM)": "40", "No-Load Speed (RPM)": "52", "Rated Current (A)": "2", "Peak Current (A)": "6.5", "Maximum Torque Density (N·m/kg)": "A1257WR-S-3P", "Height (mm)": "54", "Backlash (arcmin)": "12", "Back Drive (N·m)": "0.8", "Kv (RPM/V)": "80", "Kt (N·m/A)": "0.11", "Ke (V/kRPM)": "12.5", "Phase to Phase Resistance (mΩ)": "1.8", "Phase to Phase Inductance (μH)": "1.1", "Rotor Inertia (g·cm²)": "32", "Motor Constant (N·m/√W)": "0.15", "Mechanical Time Constant (ms)": "0.83", "Pole Pairs": "14", "Number of Slots": "24", "Winding Type": "Star", "Number of Encoder": "33", "Inner Loop Encoder Type": "14bit", "Outer Ring Encoder Resolution": "1", "CAN Connector": "A1257WR-S-3P", "UART Connector": "XT30PW-M", "Power Connector": "Magnetic Encoder", "Temperature Sensor": "NTC MF51B 103F3950", "Noise dB (65cm away the motor)": "65", "Basic Dynamic Load Rating Cr (N)": "2810", "Basic Static Load Rating C0r (N)": "2760", "Operation Ambient Temperature": "-20℃~50℃", "Insulation Level": "F", "Driving Way": "FOC", "Application": "Legged Robot, Exoskeleton, AGV" } },
  { id: "ake60-8-kv80", name: "AKE60-8 KV80", brand: "CubeMars", series: "AKE Series", collection: "integrated", art: "actuator", size: 0.98, price: 218.9,
    blurb: "CubeMars' AKE Quasi Direct Drive is the ideal choice for the industrial automation and robotics. This product integrates motor and gearbox, particularly suited for applications such as exosk",
    specs: { "Reduction Ratio": "8:1", "Rated Torque (N·m)": "5", "OD (mm)": "69", "Weight (g)": "260", "Peak Torque (N·m)": "12.5", "Rated Voltage (V)": "24", "Rated Speed (RPM)": "180", "No-Load Speed (RPM)": "240", "Rated Current (A)": "4.8", "Peak Current (A)": "12", "Maximum Torque Weight Ratio (N·m/kg)": "46", "Height (mm)": "25", "Kv (RPM/V)": "80", "Kt (N·m/A)": "0.13", "Ke (V/kRPM)": "12.5", "Phase to Phase Resistance (mΩ)": "577", "Phase to Phase Inductance (μH)": "704", "Mechanical Time Constant (ms)": "1.2", "Electrical Time Constant (ms)": "1.7", "Pole Pairs": "14 Inertia (g·cm²） 647.39", "Winding Type": "Star", "Operation Ambient Temperature": "(℃) -20℃~50℃", "Driving Way": "FOC", "Application": "Exoskeleton" } },
  { id: "aka60-6-kv80", name: "AKA60-6 KV80", brand: "CubeMars", series: "AKA Series", collection: "integrated", art: "actuator", size: 0.98, price: 298.9,
    blurb: "The AKA series is suitable for applications with high radial loads such as wheeled robots and AGVs. This series of products adopts a completely new structural design scheme.",
    specs: { "Rated Torque (N·m)": "3", "OD (mm)": "80", "Weight (g)": "460", "Peak Torque (N·m)": "9", "Rated Voltage (V)": "24/48 Km (N·m/√W) 0.1541", "Rated Speed (RPM)": "200/400", "No-Load Speed (RPM)": "320/640", "Rated Current (A)": "4", "Peak Current (A)": "11.2", "Height (mm)": "51.2", "Kv (RPM/V)": "80", "Kt (N·m/A)": "0.11937", "Ke (V/kRPM)": "0.0125", "Phase to Phase Resistance (mΩ)": "595", "Phase to Phase Inductance (μH)": "675", "Inertia (g·cm²)": "331.91", "Mechanical Time Constant (ms)": "2.5", "Electrical Time Constant (ms)": "1.13", "Pole Pairs": "14", "Winding Type": "Star", "Operation Ambient Temperature": "(℃) -20℃~50℃", "Driving Way": "FOC", "Application": "WheeledRobot, AGV" } },
  { id: "ak60-6-v3-0-kv80", name: "AK60-6 V3.0 KV80", brand: "CubeMars", series: "AK Series", collection: "integrated", art: "actuator", size: 0.98, price: 298.9,
    blurb: "The AK60-6 actuator integrates a high-performance brushless DC motor, a self-developed planetary reducer, an encoder, and an integrated drive, enabling smooth operation with high torque.Util",
    specs: { "Reduction Ratio": "6:1", "Rated Torque (N·m)": "3", "OD (mm)": "79", "Weight (g)": "380", "Peak Torque (N·m)": "9 Km (N·m/√W) 0.15", "Rated Voltage (V)": "24/48", "Rated Speed (RPM)": "233/490", "Rated Current (A)": "3.8", "Peak Current (A)": "0.3/11.2", "Maximum Torque Weight Ratio (N·m/kg)": "23.68", "Height (mm)": "43", "Back Drive (N·m)": "0.2", "Kv (RPM/V)": "80", "Kt (N·m/A)": "0.135", "Ke (V/kRPM)": "12.5", "Phase to Phase Resistance (mΩ)": "595", "Phase to Phase Inductance (μH)": "676", "Inertia (g·cm²)": "243.5", "Mechanical Time Constant (ms)": "0.81", "Electrical Time Constant (ms)": "0.69", "Pole Pairs": "14", "Winding Type": "Star Backlash (°) 0.55", "Number of Encoder": "1", "Inner Loop Encoder Type": "Magnetic Encoder", "Inner Ring Encoder Resolution": "16bit", "CAN Connector": "XT30PW(2+2)-M", "UART Connector": "A1257WR-S-3P", "Temperature Sensor": "NTC MF51B 103F3950", "Operation Ambient Temperature": "-20℃~50℃", "Driving Way": "FOC", "Application": "Legged Robot, Exoskeleton, AGV" } },
  { id: "ak60-6-v1-1-kv140", name: "AK60-6 V1.1 KV140", brand: "CubeMars", series: "AK Series", collection: "integrated", art: "actuator", size: 0.98, price: 298.9,
    blurb: "The",
    specs: { "Reduction Ratio": "6:1", "Rated Torque (N·m)": "3", "OD (mm)": "79", "Weight (g)": "368", "Peak Torque (N·m)": "9 Km (N·m/√W) 0.17", "Rated Voltage (V)": "24", "Rated Speed (RPM)": "420", "Rated Current (A)": "6.5", "Peak Current (A)": "22.7", "Maximum Torque Weight Ratio (N·m/kg)": "24.46", "Height (mm)": "39.5", "Back Drive (N·m)": "0.2", "Kv (RPM/V)": "140", "Kt (N·m/A)": "0.078", "Ke (V/kRPM)": "7.5", "Phase to Phase Resistance (mΩ)": "202", "Phase to Phase Inductance (μH)": "138", "Inertia (g·cm²)": "243.5", "Mechanical Time Constant (ms)": "0.81", "Electrical Time Constant (ms)": "0.68", "Pole Pairs": "14", "Winding Type": "Delta Backlash (°) 0.55", "Number of Encoder": "1", "Inner Loop Encoder Type": "Magnetic Encoder", "Inner Ring Encoder Resolution": "14bit", "CAN Connector": "A1257WR-S-4P", "UART Connector": "A1257WR-S-4P", "Power Connector": "XT30PW-M", "Temperature Sensor": "NTC MF51B 103F3950", "Operation Ambient Temperature": "-20℃~50℃", "Driving Way": "FOC", "Application": "Legged Robot, Exoskeleton, AGV" } },
  { id: "ake80-8-kv30", name: "AKE80-8 KV30", brand: "CubeMars", series: "AKE Series", collection: "integrated", art: "actuator", size: 1.12, price: 339.9,
    blurb: "CubeMars' AKE Quasi Direct Drive is the ideal choice for the industrial automation and robotics. This product integrates motor and gearbox, particularly suited for applications such as exosk",
    specs: { "Reduction Ratio": "8:1", "Rated Torque (N·m)": "12", "OD (mm)": "87", "Weight (g)": "570", "Peak Torque (N·m)": "30", "Rated Voltage (V)": "48", "Rated Speed (RPM)": "150", "No-Load Speed (RPM)": "195", "Rated Current (A)": "4.8", "Peak Current (A)": "12", "Maximum Torque Weight Ratio (N·m/kg)": "52", "Height (mm)": "32", "Kv (RPM/V)": "30", "Kt (N·m/A)": "0.32", "Ke (V/kRPM)": "33", "Phase to Phase Resistance (mΩ)": "870", "Phase to Phase Inductance (μH)": "990", "Mechanical Time Constant (ms)": "2.3", "Electrical Time Constant (ms)": "1.13", "Pole Pairs": "21 Inertia (g·cm²） 143", "Winding Type": "Star", "Operation Ambient Temperature": "(℃) -20℃~50℃", "Driving Way": "FOC", "Application": "Exoskeleton" } },
  { id: "ak70-9-v3-0-kv60", name: "AK70-9 V3.0 KV60", brand: "CubeMars", series: "AK Series", collection: "integrated", art: "actuator", size: 1.05, price: 398.9,
    blurb: "",
    specs: { "Reduction Ratio": "9:1", "Rated Torque (N·m)": "8.5", "OD (mm)": "89", "Weight (g)": "540", "Peak Torque (N·m)": "29.2", "Rated Voltage (V)": "48", "Rated Speed (RPM)": "260", "No-Load Speed (RPM)": "320", "Rated Current (A)": "6.25", "Peak Current (A)": "23.8", "Maximum Torque Density (N·m/kg)": "54", "Height (mm)": "49", "Backlash (arcmin)": "18", "Back Drive (N·m)": "0.8", "Kv (RPM/V)": "60", "Kt (N·m/A)": "0.159", "Ke (V/kRPM)": "16.7", "Phase to Phase Resistance (mΩ)": "475", "Phase to Phase Inductance (μH)": "408", "Rotor Inertia (g·cm²)": "450", "Motor Constant (N·m/√W)": "0.23", "Mechanical Time Constant (ms)": "1.7", "Pole Pairs": "21", "Number of Slots": "24", "Winding Type": "Delta", "Number of Encoder": "2", "Inner Loop Encoder Type": "Magnetic Encoder", "Inner Ring Encoder Resolution": "14bit", "Outer Ring Encoder Type": "Magnetic Encoder", "Outer Ring Encoder Resolution": "15bit", "CAN Connector": "A1257WR-S-4P", "UART Connector": "A1257WR-S-3P", "Power Connector": "XT30PW-M", "Temperature Sensor": "NTC MF51B 103F3950", "Noise dB (65cm away the motor)": "50", "Basic Dynamic Load Rating Cr (N)": "1890", "Basic Static Load Rating C0r (N)": "2140", "Operation Ambient Temperature": "-20℃~50℃", "Insulation Level": "C", "Driving Way": "FOC", "Application": "Legged Robot, Exoskeleton, AGV" } },
  { id: "ak70-10-kv100", name: "AK70-10 KV100", brand: "CubeMars", series: "AK Series", collection: "integrated", art: "actuator", size: 1.05, price: 398.9,
    blurb: "The AK70-10 actuator integrates a high-performance brushless DC motor, a self-developed planetary reducer, an encoder, and an integrated drive, enabling smooth operation with high torque.Uti",
    specs: { "Reduction Ratio": "10:1", "Rated Torque (N·m)": "8.3", "OD (mm)": "89", "Weight (g)": "621", "Peak Torque (N·m)": "24.8 Km (N·m/√W) 0.24", "Rated Voltage (V)": "24/48", "Rated Speed (RPM)": "148/310", "Rated Current (A)": "7.2", "Peak Current (A)": "23.2", "Maximum Torque Weight Ratio (N·m/kg)": "47.6", "Height (mm)": "50.25", "Back Drive (N·m)": "0.48", "Kv (RPM/V)": "100", "Kt (N·m/A)": "0.123", "Ke (V/kRPM)": "11.2", "Phase to Phase Resistance (mΩ)": "272", "Phase to Phase Inductance (μH)": "113", "Inertia (g·cm²)": "414", "Mechanical Time Constant (ms)": "0.74", "Electrical Time Constant (ms)": "0.42", "Pole Pairs": "21", "Winding Type": "Delta Backlash (°) 0.12", "Number of Encoder": "1", "Inner Loop Encoder Type": "Magnetic Encoder", "Inner Ring Encoder Resolution": "14bit", "CAN Connector": "A1257WR-S-4P", "UART Connector": "A1257WR-S-4P", "Power Connector": "XT30PW-M", "Temperature Sensor": "NTC MF51B 103F3950", "Operation Ambient Temperature": "-20℃~50℃", "Driving Way": "FOC", "Application": "Legged Robot, Exoskeleton, AGV" } },
  { id: "ak60-39-v3-0", name: "AK60-39 V3.0", brand: "CubeMars", series: "AK Series", collection: "integrated", art: "actuator", size: 0.98, price: 448.9,
    blurb: "",
    specs: { "Reduction Ratio": "39:1", "Rated Torque (N·m)": "24", "OD (mm)": "79", "Weight (g)": "750", "Peak Torque (N·m)": "72", "Rated Voltage (V)": "48 Outer Ring Encoder type Magnetic Encoder", "Rated Speed (RPM)": "70", "No-Load Speed (RPM)": "98", "Rated Current (A)": "4.5", "Peak Current (A)": "17", "Maximum Torque Density (N·m/kg)": "96", "Height (mm)": "48.5", "Backlash (arcmin)": "15", "Back Drive (N·m)": "1.4", "Kv (RPM/V)": "80", "Kt (N·m/A)": "0.12", "Ke (V/kRPM)": "12.5", "Phase to Phase Resistance (mΩ)": "600", "Phase to Phase Inductance (μH)": "670", "Rotor Inertia (g·cm²)": "305", "Motor Constant (N·m/√W)": "0.15", "Mechanical Time Constant (ms)": "2.39", "Pole Pairs": "14", "Number of Slots": "24", "Winding Type": "Star", "Number of Encoder": "2", "Inner Loop Encoder Type": "Magnetic Encoder", "Inner Ring Encoder Resolution": "21bit", "Outer Ring Encoder Resolution": "21bit", "CAN Connector": "A1257WR-S-3P", "UART Connector": "XT30PW-M", "Temperature Sensor": "NTC MF51B 103F3950", "Basic Dynamic Load Rating Cr (N)": "2000", "Basic Static Load Rating C0r (N)": "2520", "Operation Ambient Temperature": "-20℃~50℃", "Insulation Level": "C", "Driving Way": "FOC", "Application": "Legged Robot, Exoskeleton, AGV" } },
  { id: "ak80-8-kv60", name: "AK80-8 KV60", brand: "CubeMars", series: "AK Series", collection: "integrated", art: "actuator", size: 1.12, price: 469.9,
    blurb: "The AK80-8 actuator integrates a high-performance brushless DC motor, a self-developed planetary reducer, an encoder, and an integrated drive, enabling smooth operation with high torque.Util",
    specs: { "Reduction Ratio": "8:1", "Rated Torque (N·m)": "10", "OD (mm)": "98", "Weight (g)": "570", "Peak Torque (N·m)": "25 Km (N·m/√W) 0.30", "Rated Voltage (V)": "48", "Rated Speed (RPM)": "243", "Rated Current (A)": "6.9", "Peak Current (A)": "21", "Maximum Torque Weight Ratio (N·m/kg)": "35", "Height (mm)": "43.9", "Back Drive (N·m)": "0.75", "Kv (RPM/V)": "60", "Kt (N·m/A)": "0.199", "Ke (V/kRPM)": "19.8", "Phase to Phase Resistance (mΩ)": "430", "Phase to Phase Inductance (μH)": "214", "Inertia (g·cm²)": "608.6", "Mechanical Time Constant (ms)": "0.66", "Electrical Time Constant (ms)": "0.5", "Pole Pairs": "21", "Winding Type": "Star Backlash (°) 0.38", "Number of Encoder": "2", "Inner Loop Encoder Type": "Magnetic Encoder", "Inner Ring Encoder Resolution": "14bit", "Outer Ring Encoder Type": "Magnetic Encoder", "Outer Ring Encoder Resolution": "15bit", "CAN Connector": "A1257WR-S-4P", "UART Connector": "A1257WR-S-4P", "Power Connector": "XT30PW-M", "Temperature Sensor": "NTC MF51B 103F3950", "Operation Ambient Temperature": "-20℃~50℃", "Driving Way": "FOC", "Application": "Legged Robot, Exoskeleton, AGV" } },
  { id: "ak80-9-kv100", name: "AK80-9 KV100", brand: "CubeMars", series: "AK Series", collection: "integrated", art: "actuator", size: 1.12, price: 479.9,
    blurb: "The AK80-9 actuator integrates a high-performance brushless DC motor, a self-developed planetary reducer, an encoder, and an integrated drive, enabling smooth operation with high torque.Util",
    specs: { "Reduction Ratio": "9:1", "Rated Torque (N·m)": "9", "OD (mm)": "98", "Weight (g)": "485", "Rated Voltage (V)": "48", "Rated Speed (RPM)": "390", "Rated Current (A)": "10.3", "Peak Current (A)": "22.3", "Maximum Torque Weight Ratio (N·m/kg)": "37", "Height (mm)": "38.5", "Back Drive (N·m)": "0.51", "Kv (RPM/V)": "100", "Kt (N·m/A)": "0.105", "Ke (V/kRPM)": "10.5", "Phase to Phase Resistance (mΩ)": "170", "Phase to Phase Inductance (μH)": "57", "Inertia (g·cm²)": "607", "Mechanical Time Constant (ms)": "0.94", "Electrical Time Constant (ms)": "0.34", "Pole Pairs": "21", "Winding Type": "Delta Backlash (°) 0.19", "Number of Encoder": "1", "Inner Loop Encoder Type": "Magnetic Encoder", "Inner Ring Encoder Resolution": "14bit", "CAN Connector": "A1257WR-S-4P", "UART Connector": "A1257WR-S-4P", "Power Connector": "XT30PW-M", "Temperature Sensor": "None", "Operation Ambient Temperature": "-20℃~50℃", "Driving Way": "FOC", "Application": "Legged Robot, Exoskeleton, AGV" } },
  { id: "ake90-8-kv35", name: "AKE90-8 KV35", brand: "CubeMars", series: "AKE Series", collection: "integrated", art: "actuator", size: 1.15, price: 483.9,
    blurb: "CubeMars' AKE90-8 KV35 Quasi Direct Drive is the ideal choice for the industrial automation and robotics. This product integrates motor and gearbox, particularly suited for applications such",
    specs: { "Reduction Ratio": "8:1", "Rated Torque (N·m)": "55", "OD (mm)": "107.5", "Weight (g)": "1400", "Peak Torque (N·m)": "170", "Rated Voltage (V)": "48", "Rated Speed (RPM)": "120", "No-Load Speed (RPM)": "210", "Rated Current (A)": "21", "Peak Current (A)": "72", "Maximum Torque Weight Ratio (N·m/kg)": "121.4", "Height (mm)": "43.5", "Kv (RPM/V)": "35", "Kt (N·m/A)": "0.272", "Ke (V/kRPM)": "0.0285", "Phase to Phase Resistance (mΩ)": "164", "Phase to Phase Inductance (μH)": "235", "Mechanical Time Constant (ms)": "2.18", "Electrical Time Constant (ms)": "1.4329", "Pole Pairs": "21 Inertia (g·cm²） 3377.08", "Winding Type": "Delta", "Operation Ambient Temperature": "(℃) -20℃~50℃", "Driving Way": "FOC", "Application": "Exoskeleton" } },
  { id: "ak70-9-kv60", name: "AK70-9 KV60", brand: "CubeMars", series: "AK Series", collection: "integrated", art: "actuator", size: 1.05, price: 498.9,
    blurb: "",
    specs: {} },
  { id: "ak80-9-v3-0-kv100", name: "AK80-9 V3.0 KV100", brand: "CubeMars", series: "AK Series", collection: "integrated", art: "actuator", size: 1.12, price: 579.9,
    blurb: "",
    specs: { "Reduction Ratio": "9:1", "Rated Torque (N·m)": "9", "OD (mm)": "98", "Weight (g)": "490", "Peak Torque (N·m)": "22", "Rated Voltage (V)": "48", "Rated Speed (RPM)": "390", "No-Load Speed (RPM)": "570", "Rated Current (A)": "12", "Peak Current (A)": "28", "Maximum Torque Density (N·m/kg)": "44.9", "Height (mm)": "38.5", "Backlash (arcmin)": "15", "Back Drive (N·m)": "0.51", "Kv (RPM/V)": "100", "Kt (N·m/A)": "0.095", "Ke (V/kRPM)": "10", "Phase to Phase Resistance (mΩ)": "160", "Phase to Phase Inductance (μH)": "116", "Rotor Inertia (g·cm²)": "579", "Motor Constant (N·m/√W)": "0.2387", "Mechanical Time Constant (ms)": "0.725", "Pole Pairs": "21", "Number of Slots": "36", "Winding Type": "Delta", "Number of Encoder": "1", "Inner Loop Encoder Type": "Magnetic Encoder", "Inner Ring Encoder Resolution": "16bit", "UART Connector": "A1257WR-S-3P", "Power Connector": "XT30PW-M", "Temperature Sensor": "NTC MF51B 103F3950", "Noise dB (65cm away the motor)": "60", "Basic Dynamic Load Rating Cr (N)": "2760", "Basic Static Load Rating C0r (N)": "2810", "Operation Ambient Temperature": "-20℃~50℃", "Insulation Level": "C", "Driving Way": "FOC", "Application": "Legged Robot, Exoskeleton, AGV" } },
  { id: "aka10-9-kv60", name: "AKA10-9 KV60", brand: "CubeMars", series: "AKA Series", collection: "integrated", art: "actuator", size: 0.62, price: 798.9,
    blurb: "The AKA series is suitable for applications with high radial loads, such as wheeled robots and AGVs. This series features a brand-new structural design,achieving over a 120% increase in radi",
    specs: { "Rated Torque (N·m)": "18", "OD (mm)": "100", "Weight (g)": "1060", "Peak Torque (N·m)": "53", "Rated Voltage (V)": "48 Km (N·m/√W) 0.32", "Rated Speed (RPM)": "109", "No-Load Speed (RPM)": "320", "Rated Current (A)": "10.6", "Peak Current (A)": "32", "Height (mm)": "70", "Kv (RPM/V)": "60", "Kt (N·m/A)": "0.16", "Ke (V/kRPM)": "0.0167", "Phase to Phase Resistance (mΩ)": "248", "Phase to Phase Inductance (μH)": "235", "Inertia (g·cm²)": "1002", "Mechanical Time Constant (ms)": "1.90", "Electrical Time Constant (ms)": "0.94", "Pole Pairs": "14", "Winding Type": "Star", "Operation Ambient Temperature": "(℃) -20℃~50℃", "Driving Way": "FOC", "Application": "WheeledRobot, AGV" } },
  { id: "ak10-9-v3-0-kv60", name: "AK10-9 V3.0 KV60", brand: "CubeMars", series: "AK Series", collection: "integrated", art: "actuator", size: 0.62, price: 798.9,
    blurb: "The AK10-9 V3.0 actuator integrates a high-performance brushless DC motor, a self-developed planetary reducer, an encoder, and an integrated drive, enabling smooth operation with high torque",
    specs: { "Reduction Ratio": "9:1", "Rated Torque (N·m)": "18", "OD (mm)": "98", "Weight (g)": "940", "Peak Torque (N·m)": "53 Km (N·m/√W) 0.32", "Rated Voltage (V)": "48", "Rated Speed (RPM)": "235", "Rated Current (A)": "10.7", "Peak Current (A)": "31.9", "Maximum Torque Weight Ratio (N·m/kg)": "86", "Height (mm)": "61.7", "Back Drive (N·m)": "0.8", "Kv (RPM/V)": "60", "Kt (N·m/A)": "0.16", "Ke (V/kRPM)": "16.7", "Phase to Phase Resistance (mΩ)": "248", "Phase to Phase Inductance (μH)": "213", "Inertia (g·cm²)": "1002", "Mechanical Time Constant (ms)": "0.5", "Electrical Time Constant (ms)": "0.93", "Pole Pairs": "21", "Winding Type": "Star Backlash (°) 0.33", "Number of Encoder": "2", "Inner Ring Encoder Resolution": "21bit", "Outer Ring Encoder Type": "Magnetic Encoder", "Outer Ring Encoder Resolution": "15bit", "CAN Connector": "XT30PW(2+2)-M", "UART Connector": "A1257WR-S-3P", "Power Connector": "Magnetic Encoder", "Temperature Sensor": "NTC MF51B 103F3950", "Operation Ambient Temperature": "-20℃~50℃", "Driving Way": "FOC", "Application": "Legged Robot, Exoskeleton, AGV" } },
  { id: "ak10-9-v2-0-kv60", name: "AK10-9 V2.0 KV60", brand: "CubeMars", series: "AK Series", collection: "integrated", art: "actuator", size: 0.62, price: 798.9,
    blurb: "The AK10-9 V2.0 actuator integrates a high-performance brushless DC motor, a self-developed planetary reducer, an encoder, and an integrated drive, enabling smooth operation with high torque",
    specs: { "Reduction Ratio": "9:1", "Rated Torque (N·m)": "18", "OD (mm)": "98", "Weight (g)": "960", "Peak Torque (N·m)": "48 Km (N·m/√W) 0.45", "Rated Voltage (V)": "24/48", "Rated Speed (RPM)": "109/228", "Rated Current (A)": "10.6", "Peak Current (A)": "29.8", "Maximum Torque Weight Ratio (N·m/kg)": "50", "Height (mm)": "61.7", "Back Drive (N·m)": "0.8", "Kv (RPM/V)": "60", "Kt (N·m/A)": "0.198", "Ke (V/kRPM)": "17.2", "Phase to Phase Resistance (mΩ)": "195", "Phase to Phase Inductance (μH)": "181", "Inertia (g·cm²)": "1002", "Mechanical Time Constant (ms)": "0.50", "Electrical Time Constant (ms)": "0.93", "Pole Pairs": "21", "Winding Type": "Star Backlash (°) 0.33", "Number of Encoder": "2", "Inner Loop Encoder Type": "Magnetic Encoder", "Inner Ring Encoder Resolution": "14bit", "Outer Ring Encoder Type": "Magnetic Encoder", "Outer Ring Encoder Resolution": "15bit", "CAN Connector": "A1257WR-S-4P", "UART Connector": "A1257WR-S-4P", "Power Connector": "XT30PW-M", "Temperature Sensor": "NTC MF51B 103F3950", "Operation Ambient Temperature": "-20℃~50℃", "Driving Way": "FOC", "Application": "Legged Robot, Exoskeleton, AGV" } },
  { id: "ak80-64-kv80", name: "AK80-64 KV80", brand: "CubeMars", series: "AK Series", collection: "integrated", art: "actuator", size: 1.12, price: 989.9,
    blurb: "The AK80-64 actuator integrates a high-performance brushless DC motor, a self-developed planetary reducer, an encoder,and an integrated drive, enabling smooth operation with high torque.Util",
    specs: { "Reduction Ratio": "64:1", "Rated Torque (N·m)": "48", "OD (mm)": "98", "Weight (g)": "850", "Peak Torque (N·m)": "120 Km (N·m/√W) 0.29", "Rated Voltage (V)": "24/48", "Rated Speed (RPM)": "23/48", "Rated Current (A)": "7", "Peak Current (A)": "19", "Maximum Torque Weight Ratio (N·m/kg)": "141.2", "Height (mm)": "61.9", "Back Drive (N·m)": "4.7", "Kv (RPM/V)": "80", "Kt (N·m/A)": "0.136", "Ke (V/kRPM)": "13.7", "Phase to Phase Resistance (mΩ)": "220", "Phase to Phase Inductance (μH)": "133.5", "Inertia (g·cm²)": "564.5", "Mechanical Time Constant (ms)": "0.67", "Electrical Time Constant (ms)": "0.61", "Pole Pairs": "21", "Winding Type": "Delta Backlash (°) 0.18", "Number of Encoder": "1", "Inner Loop Encoder Type": "Magnetic Encoder", "Inner Ring Encoder Resolution": "14bit", "CAN Connector": "A1257WR-S-4P", "UART Connector": "A1257WR-S-4P", "Power Connector": "XT30PW-M", "Temperature Sensor": "NTC MF51B 103F3950", "Operation Ambient Temperature": "-20℃~50℃", "Driving Way": "FOC", "Application": "Legged Robot, Exoskeleton, AGV" } },
  { id: "akh70-16-v1-0-kv41", name: "AKH70-16 V1.0 KV41", brand: "CubeMars", series: "AKH Series", collection: "integrated", art: "hollow", size: 1.05, price: 598.0,
    blurb: "",
    specs: { "Reduction Ratio": "16:1", "Rated Torque (N·m)": "26", "OD (mm)": "90", "Weight (g)": "879", "Peak Torque (N·m)": "85", "Rated Voltage (V)": "48", "Rated Speed (RPM)": "90", "No-Load Speed (RPM)": "105", "Rated Current (A)": "6.5", "Peak Current (A)": "23", "Maximum Torque Density (N·m/kg)": "88.74", "Height (mm)": "60.5", "Backlash (arcmin)": "12", "Back Drive (N·m)": "0.78", "Kv (RPM/V)": "41", "Kt (N·m/A)": "0.23", "Ke (V/kRPM)": "2.4", "Phase to Phase Resistance (mΩ)": "0.56", "Phase to Phase Inductance (μH)": "0.6", "Rotor Inertia (g·cm²)": "1170", "Motor Constant (N·m/√W)": "0.31", "Mechanical Time Constant (ms)": "2.28", "Pole Pairs": "21", "Number of Slots": "36", "Winding Type": "Delta", "Number of Encoder": "2", "Inner Loop Encoder Type": "Magnetic Encoder", "Inner Ring Encoder Resolution": "21bit", "Outer Ring Encoder Type": "Magnetic Encoder", "Outer Ring Encoder Resolution": "21bit", "CAN Connector": "XT30PW(2+2)-M", "UART Connector": "A1257WR-S-3P", "Power Connector": "XT30PW(2+2)-M", "Temperature Sensor": "NTC MF51B 103F3950", "Noise dB (65cm away the motor)": "65", "Basic Dynamic Load Rating Cr (N)": "6350", "Basic Static Load Rating C0r (N)": "5550", "Operation Ambient Temperature": "-20℃~50℃", "Insulation Level": "F", "Driving Way": "FOC", "Application": "Legged Robot, Exoskeleton, AGV" } },
  { id: "akh70-48-v1-0-kv41", name: "AKH70-48 V1.0 KV41", brand: "CubeMars", series: "AKH Series", collection: "integrated", art: "hollow", size: 1.05, price: 698.0,
    blurb: "",
    specs: { "Reduction Ratio": "48:1", "Rated Torque (N·m)": "74", "OD (mm)": "90", "Weight (g)": "1396", "Peak Torque (N·m)": "222", "Rated Voltage (V)": "48", "Rated Speed (RPM)": "28", "No-Load Speed (RPM)": "35", "Rated Current (A)": "6", "Peak Current (A)": "21", "Maximum Torque Density (N·m/kg)": "159", "Height (mm)": "81.5", "Backlash (arcmin)": "12", "Back Drive (N·m)": "2.22", "Kv (RPM/V)": "41", "Kt (N·m/A)": "0.23", "Ke (V/kRPM)": "2.4", "Phase to Phase Resistance (mΩ)": "0.56", "Phase to Phase Inductance (μH)": "0.6", "Rotor Inertia (g·cm²)": "1170", "Motor Constant (N·m/√W)": "0.31", "Mechanical Time Constant (ms)": "2.28", "Pole Pairs": "21", "Number of Slots": "36", "Winding Type": "Delta", "Number of Encoder": "2", "Inner Loop Encoder Type": "Magnetic Encoder", "Inner Ring Encoder Resolution": "21bit", "Outer Ring Encoder Type": "Magnetic Encoder", "Outer Ring Encoder Resolution": "21bit", "CAN Connector": "XT30PW(2+2)-M", "UART Connector": "A1257WR-S-3P", "Power Connector": "XT30PW(2+2)-M", "Temperature Sensor": "NTC MF51B 103F3950", "Noise dB (65cm away the motor)": "65", "Basic Dynamic Load Rating Cr (N)": "5680", "Basic Static Load Rating C0r (N)": "8680", "Operation Ambient Temperature": "-20℃~50℃", "Insulation Level": "F", "Driving Way": "FOC", "Application": "Legged Robot, Exoskeleton, AGV" } },
  { id: "gl30-kv290", name: "GL30 KV290", brand: "CubeMars", series: "GL Series", collection: "gimbal", art: "gimbal", size: 0.76, price: 50.99,
    blurb: "CubeMars' GL series brushless DC motors are specifically designed for gimbal systems, featuring characteristics such as a large hollow structure, low cogging torque, lightweight, compact siz",
    specs: { "Rated Torque (N·m)": "0.08", "OD (mm)": "34.5", "Weight (g)": "41", "Peak Torque (N·m)": "0.28", "Rated Voltage (V)": "12", "Rated Speed (RPM)": "1990", "No-Load Speed (RPM)": "3060", "Rated Current (A)": "2.13", "Peak Current (A)": "7.4", "Maximum Torque Weight Ratio (N·m/kg)": "6.83", "Height (mm)": "15.7", "Kv (RPM/V)": "290", "Kt (N·m/A)": "0.038", "Ke (V/kRPM)": "3.73", "Phase to Phase Resistance (mΩ)": "1530", "Phase to Phase Inductance (μH)": "330", "Inertia (g·cm²)": "24.2", "Mechanical Time Constant (ms)": "2.56", "Electrical Time Constant (ms)": "0.22", "Pole Pairs": "7", "Winding Type": "Star", "Operation Ambient Temperature": "-20℃~50℃", "Driving Way": "FOC", "Application": "Gimbal, Radar" } },
  { id: "gl35-kv100", name: "GL35 KV100", brand: "CubeMars", series: "GL Series", collection: "gimbal", art: "gimbal", size: 0.8, price: 54.99,
    blurb: "CubeMars' GL series brushless DC motors are specifically designed for gimbal systems, featuring characteristics such as a large hollow structure, low cogging torque, lightweight, compact siz",
    specs: { "Rated Torque (N·m)": "0.15", "OD (mm)": "41.8", "Weight (g)": "90", "Peak Torque (N·m)": "0.46", "Rated Voltage (V)": "16", "Rated Speed (RPM)": "815", "No-Load Speed (RPM)": "1320", "Rated Current (A)": "1.3", "Peak Current (A)": "4", "Maximum Torque Weight Ratio (N·m/kg)": "5.11", "Height (mm)": "21", "Kv (RPM/V)": "100", "Kt (N·m/A)": "0.115", "Ke (V/kRPM)": "11.54", "Phase to Phase Resistance (mΩ)": "3600", "Phase to Phase Inductance (μH)": "2100", "Inertia (g·cm²)": "61", "Mechanical Time Constant (ms)": "1.66", "Electrical Time Constant (ms)": "0.58", "Pole Pairs": "7", "Winding Type": "Star", "Operation Ambient Temperature": "-20℃~50℃", "Driving Way": "FOC", "Application": "Gimbal, Radar" } },
  { id: "gl40-kv70", name: "GL40 KV70", brand: "CubeMars", series: "GL Series", collection: "gimbal", art: "gimbal", size: 0.84, price: 72.99,
    blurb: "CubeMars' GL series brushless DC motors are specifically designed for gimbal systems, featuring characteristics such as a large hollow structure, low cogging torque, lightweight, compact siz",
    specs: { "Rated Torque (N·m)": "0.25", "OD (mm)": "46.5", "Weight (g)": "107", "Peak Torque (N·m)": "0.5", "Rated Voltage (V)": "16", "Rated Speed (RPM)": "430", "No-Load Speed (RPM)": "1015", "Rated Current (A)": "1.62", "Peak Current (A)": "3.3", "Maximum Torque Weight Ratio (N·m/kg)": "4.67", "Height (mm)": "21.5", "Kv (RPM/V)": "70", "Kt (N·m/A)": "0.150", "Ke (V/kRPM)": "15.00", "Phase to Phase Resistance (mΩ)": "4500", "Phase to Phase Inductance (μH)": "1800", "Inertia (g·cm²)": "74", "Mechanical Time Constant (ms)": "1.48", "Electrical Time Constant (ms)": "0.40", "Pole Pairs": "14", "Winding Type": "Star", "Operation Ambient Temperature": "-20℃~50℃", "Driving Way": "FOC", "Application": "Gimbal, Radar" } },
  { id: "gl60-kv25", name: "GL60 KV25", brand: "CubeMars", series: "GL Series", collection: "gimbal", art: "gimbal", size: 0.98, price: 108.99,
    blurb: "CubeMars' GL series brushless DC motors are specifically designed for gimbal systems, featuring characteristics such as a large hollow structure, low cogging torque, lightweight, compact siz",
    specs: { "Rated Torque (N·m)": "0.6", "OD (mm)": "69", "Weight (g)": "230", "Peak Torque (N·m)": "1.75", "Rated Voltage (V)": "24", "Rated Speed (RPM)": "310", "No-Load Speed (RPM)": "516", "Rated Current (A)": "1.35", "Peak Current (A)": "4", "Maximum Torque Weight Ratio (N·m/kg)": "7.61", "Height (mm)": "22.3", "Kv (RPM/V)": "25", "Kt (N·m/A)": "0.450", "Ke (V/kRPM)": "44.30", "Phase to Phase Resistance (mΩ)": "5500", "Phase to Phase Inductance (μH)": "2720", "Inertia (g·cm²)": "355", "Mechanical Time Constant (ms)": "0.96", "Electrical Time Constant (ms)": "0.49", "Pole Pairs": "14", "Winding Type": "Star", "Operation Ambient Temperature": "-20℃~50℃", "Driving Way": "FOC", "Application": "Gimbal, Radar" } },
  { id: "gl40-kv82-5", name: "GL40Ⅱ KV82.5", brand: "CubeMars", series: "GL Series", collection: "gimbal", art: "gimbal", size: 0.84, price: 133.99,
    blurb: "The GL40ll series motors, specifically engineered for premium gimbal systems, excel in both gimbals and autonomous driving applications. Advancing from the GL series, the GL40ll series incor",
    specs: { "Rated Torque (N·m)": "0.25", "OD (mm)": "46.1", "Weight (g)": "112", "Peak Torque (N·m)": "0.68", "Rated Voltage (V)": "16", "Rated Speed (RPM)": "697", "No-Load Speed (RPM)": "1388", "Rated Current (A)": "1.88", "Peak Current (A)": "5.22", "Maximum Torque Weight Ratio (N·m/kg)": "60.71", "Height (mm)": "33.5", "Kv (RPM/V)": "82.5", "Kt (N·m/A)": "0.11", "Ke (V/kRPM)": "0.0115", "Phase to Phase Resistance (mΩ)": "3000", "Phase to Phase Inductance (μH)": "1320", "Inertia (g·cm²)": "0.794578", "Mechanical Time Constant (ms)": "2.045", "Electrical Time Constant (ms)": "0.44", "Pole Pairs": "14", "Winding Type": "Star", "Operation Ambient Temperature": "-20℃~50℃", "Driving Way": "FOC", "Application": "Gimbal, Radar" } },
  { id: "gl60-kv28", name: "GL60 Ⅱ KV28", brand: "CubeMars", series: "GL Series", collection: "gimbal", art: "gimbal", size: 0.98, price: 166.99,
    blurb: "The GLII series motors are specifically designed for high-end gimbal systems. With outstanding performance and innovative technology, they are widely used in high-precision control scenarios",
    specs: { "Rated Torque (N·m)": "0.6", "OD (mm)": "70.5", "Weight (g)": "276", "Peak Torque (N·m)": "1", "Rated Speed (RPM)": "153", "Rated Current (A)": "1.56", "Peak Current (A)": "2.75", "Height (mm)": "33.6", "Rotor Inertia (g·cm²)": "401.086", "Application": "Gimbal, Radar Bearings Imported 6705 ZZ" } },
  { id: "gl80-kv60", name: "GL80 KV60", brand: "CubeMars", series: "GL Series", collection: "gimbal", art: "gimbal", size: 1.12, price: 181.99,
    blurb: "CubeMars' GL series brushless DC motors are specifically designed for gimbal systems, featuring characteristics such as a large hollow structure, low cogging torque, lightweight, compact siz",
    specs: { "Rated Torque (N·m)": "1", "OD (mm)": "87", "Weight (g)": "315", "Peak Torque (N·m)": "2.9", "Rated Voltage (V)": "24", "Rated Speed (RPM)": "1010", "No-Load Speed (RPM)": "1300", "Rated Current (A)": "5.6", "Peak Current (A)": "16.3", "Maximum Torque Weight Ratio (N·m/kg)": "9.21", "Height (mm)": "22.3", "Kv (RPM/V)": "60", "Kt (N·m/A)": "0.178", "Ke (V/kRPM)": "17.47", "Phase to Phase Resistance (mΩ)": "450", "Phase to Phase Inductance (μH)": "270", "Inertia (g·cm²)": "650", "Mechanical Time Constant (ms)": "0.92", "Electrical Time Constant (ms)": "0.60", "Pole Pairs": "21", "Winding Type": "Star", "Operation Ambient Temperature": "-20℃~50℃", "Driving Way": "FOC", "Application": "Gimbal, Radar" } },
  { id: "gl80-kv30", name: "GL80 KV30", brand: "CubeMars", series: "GL Series", collection: "gimbal", art: "gimbal", size: 1.12, price: 181.99,
    blurb: "CubeMars' GL series brushless DC motors are specifically designed for gimbal systems, featuring characteristics such as a large hollow structure, low cogging torque, lightweight, compact siz",
    specs: { "Rated Torque (N·m)": "1", "OD (mm)": "87", "Weight (g)": "315", "Peak Torque (N·m)": "2.9", "Rated Voltage (V)": "24", "Rated Speed (RPM)": "450", "No-Load Speed (RPM)": "650", "Rated Current (A)": "2.8", "Peak Current (A)": "8.2", "Maximum Torque Weight Ratio (N·m/kg)": "9.21", "Height (mm)": "22.3", "Kv (RPM/V)": "30", "Kt (N·m/A)": "0.356", "Ke (V/kRPM)": "35.27", "Phase to Phase Resistance (mΩ)": "1800", "Phase to Phase Inductance (μH)": "1100", "Inertia (g·cm²)": "650", "Mechanical Time Constant (ms)": "0.92", "Electrical Time Constant (ms)": "0.61", "Pole Pairs": "21", "Winding Type": "Star", "Operation Ambient Temperature": "-20℃~50℃", "Driving Way": "FOC", "Application": "Gimbal, Radar" } },
  { id: "gl100-kv10", name: "GL100 KV10", brand: "CubeMars", series: "GL Series", collection: "gimbal", art: "gimbal", size: 1.15, price: 272.99,
    blurb: "CubeMars' GL series brushless DC motors are specifically designed for gimbal systems, featuring characteristics such as a large hollow structure, low cogging torque, lightweight, compact siz",
    specs: { "Rated Torque (N·m)": "3", "OD (mm)": "106.8", "Weight (g)": "698", "Peak Torque (N·m)": "7.7", "Rated Voltage (V)": "24", "Rated Speed (RPM)": "130", "No-Load Speed (RPM)": "223", "Rated Current (A)": "2.9", "Peak Current (A)": "7.8", "Maximum Torque Weight Ratio (N·m/kg)": "11.03", "Height (mm)": "34.2", "Kv (RPM/V)": "10", "Kt (N·m/A)": "1.030", "Ke (V/kRPM)": "102.4", "Phase to Phase Resistance (mΩ)": "2650", "Phase to Phase Inductance (μH)": "2350", "Inertia (g·cm²)": "2310", "Mechanical Time Constant (ms)": "0.58", "Electrical Time Constant (ms)": "0.89", "Pole Pairs": "20", "Winding Type": "Star", "Operation Ambient Temperature": "-20℃~50℃", "Driving Way": "FOC", "Application": "Gimbal, Radar" } },
  { id: "ri20-kv600", name: "RI20 KV600", brand: "CubeMars", series: "RI Series", collection: "frameless", art: "frameless", size: 0.69, price: 42.9,
    blurb: "",
    specs: { "OD (mm)": "25", "Weight (g)": "20", "Peak Torque (N·m)": "72", "Rated Voltage (V)": "16", "Rated Speed (RPM)": "7452", "No-Load Speed (RPM)": "9600", "Rated Current (A)": "1.47 Km (N·m/√W) 0.0115", "Peak Current (A)": "4.4", "Maximum Torque Weight Ratio (N·m/kg)": "4.85", "Height (mm)": "14.5", "Kv (RPM/V)": "600", "Kt (N·m/A)": "0.01592", "Ke (V/kRPM)": "0.0016", "Phase to Phase Resistance (mΩ)": "1.89", "Phase to Phase Inductance (μH)": "0.45", "Inertia (g·cm²)": "1.38", "Mechanical Time Constant (ms)": "1.03", "Electrical Time Constant (ms)": "0.24", "Pole Pairs": "7", "Winding Type": "- Phase -", "Operation Ambient Temperature": "-20℃~50℃", "Driving Way": "FOC", "Application": "Cobot Arm, Exoskeleton" } },
  { id: "ri30-kv260", name: "RI30 KV260", brand: "CubeMars", series: "RI Series", collection: "frameless", art: "frameless", size: 0.76, price: 51.9,
    blurb: "",
    specs: { "OD (mm)": "38", "Weight (g)": "40", "Peak Torque (N·m)": "230", "Rated Voltage (V)": "24", "Rated Speed (RPM)": "4110", "No-Load Speed (RPM)": "6240", "Rated Current (A)": "1.98 Km (N·m/√W) 0.0247", "Peak Current (A)": "7.72", "Maximum Torque Weight Ratio (N·m/kg)": "2.14", "Height (mm)": "14", "Kv (RPM/V)": "260", "Kt (N·m/A)": "0.03673", "Ke (V/kRPM)": "0.0038", "Phase to Phase Resistance (mΩ)": "2.2", "Phase to Phase Inductance (μH)": "1.41", "Inertia (g·cm²)": "4.23", "Mechanical Time Constant (ms)": "0.69", "Electrical Time Constant (ms)": "0.64", "Pole Pairs": "7", "Winding Type": "- Phase -", "Operation Ambient Temperature": "-20℃~50℃", "Driving Way": "FOC", "Application": "Cobot Arm, Exoskeleton" } },
  { id: "ro40-kv140-lite", name: "RO40 KV140 Lite", brand: "CubeMars", series: "RO Series", collection: "frameless", art: "frameless", size: 0.84, price: 51.9,
    blurb: "",
    specs: { "Rated Torque (N·m)": "0.2", "OD (mm)": "46.3", "Weight (g)": "- Stator", "Peak Torque (N·m)": "0.2", "Rated Voltage (V)": "24", "Rated Speed (RPM)": "2450", "No-Load Speed (RPM)": "3400", "Rated Current (A)": "2.85", "Peak Current (A)": "11.6", "Height (mm)": "13", "Kv (RPM/V)": "141", "Kt (N·m/A)": "0.068", "Ke (V/kRPM)": "7", "Phase to Phase Resistance (mΩ)": "1700", "Phase to Phase Inductance (μH)": "580", "Inertia (g·cm²)": "122.11", "Mechanical Time Constant (ms)": "2.2", "Electrical Time Constant (ms)": "0.34", "Pole Pairs": "14", "Operation Ambient Temperature": "-20℃~50℃", "Driving Way": "FOC", "Application": "Cobot Arm, Exoskeleton" } },
  { id: "ri50-kv100", name: "RI50 KV100", brand: "CubeMars", series: "RI Series", collection: "frameless", art: "frameless", size: 0.91, price: 61.9,
    blurb: "CubeMars has introduced the RI series frameless inrunner motor, an ideal choice for high-precision joint motors and brushless DC motors in the fields of industrial automation and robotics te",
    specs: { "Rated Torque (N·m)": "0.58", "OD (mm)": "54", "Weight (g)": "180.8", "Peak Torque (N·m)": "1.67", "Rated Voltage (V)": "24/36/48", "Rated Speed (RPM)": "1090/1860/2600", "No-Load Speed (RPM)": "2004/3006/4008", "Rated Current (A)": "4.8 Km (N·m/√W) 0.1007", "Peak Current (A)": "14.8", "Maximum Torque Weight Ratio (N·m/kg)": "9.24", "Height (mm)": "27", "Kv (RPM/V)": "100", "Kt (N·m/A)": "0.120", "Ke (V/kRPM)": "11.41", "Phase to Phase Resistance (mΩ)": "1420", "Phase to Phase Inductance (μH)": "1500", "Inertia (g·cm²)": "22.8", "Mechanical Time Constant (ms)": "0.22", "Electrical Time Constant (ms)": "1.06", "Pole Pairs": "7", "Winding Type": "Star Phase 3", "Operation Ambient Temperature": "-20℃~50℃", "Driving Way": "FOC", "Application": "Cobot Arm, Exoskeleton" } },
  { id: "ro50-kv108-lite", name: "RO50 KV108 Lite", brand: "CubeMars", series: "RO Series", collection: "frameless", art: "frameless", size: 0.91, price: 65.9,
    blurb: "",
    specs: { "Rated Torque (N·m)": "0.3", "OD (mm)": "61.7", "Weight (g)": "- Stator", "Peak Torque (N·m)": "0.9", "Rated Voltage (V)": "24", "Rated Speed (RPM)": "2100", "No-Load Speed (RPM)": "2600", "Rated Current (A)": "3.4", "Peak Current (A)": "0.9", "Height (mm)": "14.5", "Kv (RPM/V)": "108", "Kt (N·m/A)": "0.088", "Ke (V/kRPM)": "9.2", "Phase to Phase Resistance (mΩ)": "1035", "Phase to Phase Inductance (μH)": "460", "Inertia (g·cm²)": "327.21", "Mechanical Time Constant (ms)": "2.4", "Electrical Time Constant (ms)": "0.44", "Pole Pairs": "14", "Operation Ambient Temperature": "-20℃~50℃", "Driving Way": "FOC", "Application": "Cobot Arm, Exoskeleton" } },
  { id: "ro60-kv115", name: "RO60 KV115", brand: "CubeMars", series: "RO Series", collection: "frameless", art: "frameless", size: 0.98, price: 77.9,
    blurb: "The CubeMars RO series brushless DC outer rotor torque motor is introduced to meet diverse market demands, catering to applications in exoskeleton robotics, collaborative robotic arms, as we",
    specs: { "Rated Torque (N·m)": "0.8", "OD (mm)": "73.8", "Weight (g)": "248", "Peak Torque (N·m)": "2.4", "Rated Voltage (V)": "48", "Rated Speed (RPM)": "4200", "No-Load Speed (RPM)": "5230", "Rated Current (A)": "8.5", "Peak Current (A)": "40", "Maximum Torque Weight Ratio (N·m/kg)": "10", "Height (mm)": "23", "Kv (RPM/V)": "115", "Kt (N·m/A)": "0.094", "Ke (V/kRPM)": "8.28", "Phase to Phase Resistance (mΩ)": "300", "Phase to Phase Inductance (μH)": "395", "Inertia (g·cm²)": "840", "Mechanical Time Constant (ms)": "2.86", "Electrical Time Constant (ms)": "1.32", "Pole Pairs": "14", "Winding Type": "Star", "Operation Ambient Temperature": "-20℃~50℃", "Driving Way": "FOC", "Application": "Cobot Arm, Exoskeleton" } },
  { id: "ri60-kv120", name: "RI60 KV120", brand: "CubeMars", series: "RI Series", collection: "frameless", art: "frameless", size: 0.98, price: 98.9,
    blurb: "CubeMars has introduced the RI series frameless inrunner motor, an ideal choice for high-precision joint motors and brushless DC motors in the fields of industrial automation and robotics te",
    specs: { "Rated Torque (N·m)": "0.57", "OD (mm)": "60", "Weight (g)": "155.9", "Peak Torque (N·m)": "1.63", "Rated Voltage (V)": "24/36/48", "Rated Speed (RPM)": "1440/2320/3190", "No-Load Speed (RPM)": "2532/3798/5064", "Rated Current (A)": "5.6 Km (N·m/√W) 0.1054", "Peak Current (A)": "16.8", "Maximum Torque Weight Ratio (N·m/kg)": "10.46", "Height (mm)": "23", "Kv (RPM/V)": "120", "Kt (N·m/A)": "0.100", "Ke (V/kRPM)": "9.03", "Phase to Phase Resistance (mΩ)": "900", "Phase to Phase Inductance (μH)": "877.5", "Inertia (g·cm²)": "33.05", "Mechanical Time Constant (ms)": "0.30", "Electrical Time Constant (ms)": "0.98", "Pole Pairs": "14", "Winding Type": "Delta Phase 3", "Operation Ambient Temperature": "-20℃~50℃", "Driving Way": "FOC", "Application": "Cobot Arm, Exoskeleton" } },
  { id: "ro80-kv105", name: "RO80 KV105", brand: "CubeMars", series: "RO Series", collection: "frameless", art: "frameless", size: 1.12, price: 104.9,
    blurb: "The CubeMars RO series brushless DC outer rotor torque motor is introduced to meet diverse market demands, catering to applications in exoskeleton robotics, collaborative robotic arms, as we",
    specs: { "Rated Torque (N·m)": "1.3", "OD (mm)": "92.6", "Weight (g)": "345", "Peak Torque (N·m)": "4.5", "Rated Voltage (V)": "48", "Rated Speed (RPM)": "4000", "No-Load Speed (RPM)": "4800", "Rated Current (A)": "15", "Peak Current (A)": "55", "Maximum Torque Weight Ratio (N·m/kg)": "13", "Height (mm)": "26.4", "Kv (RPM/V)": "105", "Kt (N·m/A)": "0.087", "Ke (V/kRPM)": "9.07", "Phase to Phase Resistance (mΩ)": "120", "Phase to Phase Inductance (μH)": "103", "Inertia (g·cm²)": "1859", "Mechanical Time Constant (ms)": "2.95", "Electrical Time Constant (ms)": "0.86", "Pole Pairs": "21", "Winding Type": "Delta", "Operation Ambient Temperature": "-20℃~50℃", "Driving Way": "FOC", "Application": "Cobot Arm, Exoskeleton" } },
  { id: "ri70-kv95", name: "RI70 KV95", brand: "CubeMars", series: "RI Series", collection: "frameless", art: "frameless", size: 1.05, price: 123.9,
    blurb: "CubeMars has introduced the RI series frameless inrunner motor, an ideal choice for high-precision joint motors and brushless DC motors in the fields of industrial automation and robotics te",
    specs: { "Rated Torque (N·m)": "0.94", "OD (mm)": "76", "Weight (g)": "270.4", "Peak Torque (N·m)": "2.68", "Rated Voltage (V)": "24/36/48", "Rated Speed (RPM)": "1270/1990/2710", "No-Load Speed (RPM)": "1956/2934/3912", "Rated Current (A)": "7.1 Km (N·m/√W) 0.2011", "Peak Current (A)": "21", "Maximum Torque Weight Ratio (N·m/kg)": "9.91", "Height (mm)": "24", "Kv (RPM/V)": "95", "Kt (N·m/A)": "0.130", "Ke (V/kRPM)": "11.69", "Phase to Phase Resistance (mΩ)": "418", "Phase to Phase Inductance (μH)": "622.7", "Inertia (g·cm²)": "92.15", "Mechanical Time Constant (ms)": "0.23", "Electrical Time Constant (ms)": "1.49", "Pole Pairs": "14", "Winding Type": "Delta Phase 3", "Operation Ambient Temperature": "-20℃~50℃", "Driving Way": "FOC", "Application": "Cobot Arm, Exoskeleton" } },
  { id: "ri80-v2-0-kv75", name: "RI80 V2.0 KV75", brand: "CubeMars", series: "RI Series", collection: "frameless", art: "frameless", size: 1.12, price: 132.9,
    blurb: "CubeMars has introduced the RI series frameless inrunner motor, an ideal choice for high-precision joint motors and brushless DC motors in the fields of industrial automation and robotics te",
    specs: { "Rated Torque (N·m)": "1.45", "OD (mm)": "85", "Weight (g)": "411", "Peak Torque (N·m)": "4.1", "Rated Voltage (V)": "24/36/48", "Rated Speed (RPM)": "1135/1785/2430", "No-Load Speed (RPM)": "1480/2220/2960", "Rated Current (A)": "9.4 Km (N·m/√W) 0.2698", "Peak Current (A)": "27.6", "Maximum Torque Weight Ratio (N·m/kg)": "9.3", "Height (mm)": "27", "Kv (RPM/V)": "75", "Kt (N·m/A)": "0.155", "Ke (V/kRPM)": "15.5", "Phase to Phase Resistance (mΩ)": "330", "Phase to Phase Inductance (μH)": "510", "Inertia (g·cm²)": "212.49", "Mechanical Time Constant (ms)": "0.29", "Electrical Time Constant (ms)": "1.55", "Pole Pairs": "8", "Winding Type": "Delta Phase 3", "Operation Ambient Temperature": "-20℃~50℃", "Driving Way": "FOC", "Application": "Cobot Arm, Exoskeleton" } },
  { id: "ri75-ph-kv70", name: "RI75-PH KV70", brand: "CubeMars", series: "RI Series", collection: "frameless", art: "frameless", size: 1.09, price: 138.9,
    blurb: "CubeMars introduces the RI-PH series frameless inner-rotor motors, as a brushless DC motor, it's an ideal choice for industrial automation and robotics technology. This motor is specially de",
    specs: { "OD (mm)": "70", "Weight (g)": "348", "Peak Torque (N·m)": "3.8", "Peak Current (A)": "24.2 (Ref)", "Height (mm)": "31.8", "Inertia (g·cm²)": "416", "Electrical Time Constant (ms)": "0.0013", "Pole Pairs": "14" } },
  { id: "ri85-ph-kv85", name: "RI85-PH KV85", brand: "CubeMars", series: "RI Series", collection: "frameless", art: "frameless", size: 1.15, price: 147.9,
    blurb: "CubeMars introduces the RI-PH series frameless inner-rotor motors, as a brushless DC motor, it's an ideal choice for industrial automation and robotics technology. This motor is specially de",
    specs: { "OD (mm)": "85", "Weight (g)": "411", "Peak Torque (N·m)": "5", "Peak Current (A)": "44 (Ref)", "Height (mm)": "27.3", "Inertia (g·cm²)": "652", "Electrical Time Constant (ms)": "0.0017", "Pole Pairs": "14" } },
  { id: "ri100-kv105", name: "RI100 KV105", brand: "CubeMars", series: "RI Series", collection: "frameless", art: "frameless", size: 1.15, price: 148.9,
    blurb: "CubeMars has introduced the RI series frameless inrunner motor, an ideal choice for high-precision joint motors and brushless DC motors in the fields of industrial automation and robotics te",
    specs: { "Rated Torque (N·m)": "1.76", "OD (mm)": "104", "Weight (g)": "500", "Peak Torque (N·m)": "4.95", "Rated Voltage (V)": "24/36/48", "Rated Speed (RPM)": "1370/2100/2825", "No-Load Speed (RPM)": "2184/3276/4368", "Rated Current (A)": "13.6 Km (N·m/√W) 0.3634", "Peak Current (A)": "38.6", "Maximum Torque Weight Ratio (N·m/kg)": "9.9", "Height (mm)": "26", "Kv (RPM/V)": "105", "Kt (N·m/A)": "0.129", "Ke (V/kRPM)": "10.47", "Phase to Phase Resistance (mΩ)": "126", "Phase to Phase Inductance (μH)": "366.7", "Inertia (g·cm²)": "215.5", "Mechanical Time Constant (ms)": "0.16", "Electrical Time Constant (ms)": "2.91", "Pole Pairs": "14", "Winding Type": "Delta Phase 3", "Operation Ambient Temperature": "-20℃~50℃", "Driving Way": "FOC", "Application": "Cobot Arm, Exoskeleton" } },
  { id: "ro100-kv55", name: "RO100 KV55", brand: "CubeMars", series: "RO Series", collection: "frameless", art: "frameless", size: 1.15, price: 156.9,
    blurb: "The CubeMars RO series brushless DC outer rotor torque motor is introduced to meet diverse market demands, catering to applications in exoskeleton robotics, collaborative robotic arms, as we",
    specs: {} },
  { id: "ri115-ph-kv40", name: "RI115-PH KV40", brand: "CubeMars", series: "RI Series", collection: "frameless", art: "frameless", size: 1.15, price: 199.9,
    blurb: "CubeMars introduces the RI-PH series frameless inner-rotor motors, as a brushless DC motor, it's an ideal choice for industrial automation and robotics technology. This motor is specially de",
    specs: { "OD (mm)": "115", "Weight (g)": "1108", "Peak Torque (N·m)": "16", "Peak Current (A)": "52 (Ref)", "Height (mm)": "38.1", "Inertia (g·cm²)": "3461", "Electrical Time Constant (ms)": "0.0018", "Pole Pairs": "20" } },
  { id: "rubik-link-v3-0", name: "RUBIK LINK V3.0", brand: "CubeMars", series: "Accessories", collection: "accessories", art: "accessory", size: 0.8, price: 21.9,
    blurb: "R-LINK V3.0 is a USB-to-serial module specifically designed for the CubeMars AK3.0 series power modules.",
    specs: {} },
  { id: "s-link-v1-0", name: "S-LINK V1.0", brand: "CubeMars", series: "Accessories", collection: "accessories", art: "accessory", size: 0.8, price: 39.9,
    blurb: "S-LINK V1.0 is a device used for data communication with the GLII series power modules. It can record the real-time status of the power module system, meeting the user's needs for data tunin",
    specs: {} },
  { id: "rubik-link-v2-0", name: "RUBIK LINK V2.0", brand: "CubeMars", series: "Accessories", collection: "accessories", art: "accessory", size: 0.8, price: 39.9,
    blurb: "",
    specs: {} },
  { id: "driver-board-for-ak-series", name: "Driver Board for AK Series", brand: "CubeMars", series: "Accessories", collection: "accessories", art: "accessory", size: 0.8, price: 59.99,
    blurb: "",
    specs: {} },
  { id: "driver-board-for-aka-series", name: "Driver Board for AKA Series", brand: "CubeMars", series: "Accessories", collection: "accessories", art: "accessory", size: 0.8, price: 79.9,
    blurb: "",
    specs: {} },
  { id: "driver-board-for-ake-series", name: "Driver Board for AKE Series", brand: "CubeMars", series: "Accessories", collection: "accessories", art: "accessory", size: 0.8, price: 79.9,
    blurb: "",
    specs: {} },
  { id: "driver-board-v2-2", name: "Driver-board-V2.2", brand: "CubeMars", series: "Accessories", collection: "accessories", art: "accessory", size: 0.8, price: 79.9,
    blurb: "The CubeMars Driver Board-V2.2 is designed for use with the AK60-6 model integrated into the AK series. It operates at a rated voltage of 24V, has a peak current of 10A, an onboard 14-bit si",
    specs: {} },
  { id: "driver-board-for-akh-series", name: "Driver Board for AKH Series", brand: "CubeMars", series: "Accessories", collection: "accessories", art: "accessory", size: 0.8, price: 103.0,
    blurb: "",
    specs: {} },
  { id: "driver-board-v2-1", name: "Driver-board-V2.1", brand: "CubeMars", series: "Accessories", collection: "accessories", art: "accessory", size: 0.8, price: 129.9,
    blurb: "The CubeMars Driver Board-V2.1 is the second version of the planetary brushless motor controller integrated into the AK series,",
    specs: {} }
];

/* Checkout methods offered. Order here is the order shown at checkout. */
window.PAYMENT_METHODS = [
  {
    id: "card", label: "Credit Card / Apple Pay", eyebrow: "Instant",
    blurb: "Pay now by card, Apple Pay, or Google Pay. Ships as soon as payment clears.",
    detail: "Best for one or two units. Card details are entered on Stripe's own hosted page — they never touch this site.",
    fee: "No surcharge"
  },
  {
    id: "ach", label: "ACH Bank Payment", eyebrow: "Recommended over $1,000",
    blurb: "Pay directly from a US bank account through Stripe.",
    detail: "The cheapest way to pay for larger orders, and the one most finance departments prefer. Settlement takes a few business days; we reserve your stock as soon as the payment is initiated.",
    fee: "No surcharge", recommended: true
  },
  {
    id: "quote", label: "Request Volume Quote", eyebrow: "10+ units",
    blurb: "Volume pricing, scheduled releases, and custom configurations.",
    detail: "Price breaks start at 10 units per model and improve again at 50 and 250. We can also hold stock against a release forecast so you are not warehousing a year of inventory.",
    fee: "Reply within 2 business days"
  }
];

window.FAQ = [
  {
    q: "What do you carry?",
    a: "The CubeMars line: AK integrated planetary actuators, AKE and AKA variants, AKH hollow-bore joints, GL gimbal motors, RI and RO frameless sets, and the driver boards, CAN adapters, and links that go with them."
  },
  {
    q: "How do I choose between planetary, hollow-bore, and frameless?",
    a: "Planetary is the default: best price per Nm, decent backdrivability at low ratios, some backlash. Hollow-bore is the same idea with a through shaft, so power and CAN run inside the joint instead of around it — worth it once an arm has more than two or three degrees of freedom. Frameless sets have no housing at all and suit teams designing their own actuator geometry. If you are closing a torque loop, stay at low ratios or go direct drive."
  },
  {
    q: "How can I pay?",
    a: "Card and Apple Pay for small orders, ACH bank payment for anything over about $1,000. Orders of 10 or more units per model should request a volume quote first."
  },
  {
    q: "How fast will my order arrive?",
    a: "Lead time depends on the model and the quantity, so we confirm it in writing with your quote or order confirmation rather than promising a blanket figure. ACH orders are released once the payment clears, typically three to four business days after it is initiated."
  },
  {
    q: "Do I pay tariffs or import duties?",
    a: "It depends on the parts and where they ship from and to. Where duty or customs charges apply, they are itemised in your quote before you pay — we do not leave you with a brokerage invoice you were not told about."
  },
  {
    q: "Can you supply something not listed here?",
    a: "Usually. We can quote across a much wider catalogue than the models listed here, including custom windings, gear ratios, connector pinouts, and shaft geometry. Send the specification."
  }
];
