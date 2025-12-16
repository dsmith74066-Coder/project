import { useState, useRef, useEffect } from "react";
import { Stage, Layer, Text, Image as KonvaImage, Rect } from "react-konva";

function useImage(url) {
  const [image, setImage] = useState(null);
  useEffect(() => {
    if (!url) return;
    const img = new window.Image();
    img.src = url;
    img.onload = () => setImage(img);
  }, [url]);
  return image;
}

// Available background images
const backgroundImages = [
  { name: "Oklahoma Flag", file: "FlagOklahoma.png" },
  { name: "Native QSL", file: "qslCardNative.png" },
  { name: "Eagle", file: "qslEagle.png" },
  { name: "Christmas", file: "qslxmas.png" },
  { name: "Christmas1", file: "qslxmas1.png" },
  { name: "Christmas2", file: "qslxmas2.png" },
];

// Get current UTC date and time
const getUTCDateTime = () => {
  const now = new Date();
  const date = now.toISOString().split('T')[0];
  const time = now.toISOString().split('T')[1].substring(0, 5);
  return { date, time };
};

// Default positions for reset
const defaultPositions = {
  callsign: { x: 40, y: 200 },
  operatorQth: { x: 50, y: 290 },
  grid: { x: 40, y: 180 },
  qsoDetails: { x: 0, y: 560 },
  zones: { x: 238, y: 180 },
  contact: { x: 800, y: 220 },
  comments: { x: 40, y: 330 },
};

// Default text styles
const defaultStyles = {
  callsignColor: "#19f5ff",
  callsignSize: 96,
  operatorQthColor: "#19f5ff",
  operatorQthSize: 28,
  gridColor: "#19f5ff",
  gridSize: 26,
  qsoDetailsColor: "#fbfcfd",
  qsoDetailsSize: 24,
  zonesColor: "#19f5ff",
  zonesSize: 26,
  contactColor: "#0C0A09",
  contactSize: 55,
  commentsColor: "#ffffff",
  commentsSize: 18,
};

export default function App() {
  const stageRef = useRef(null);
  const utc = getUTCDateTime();

  const [selectedBg, setSelectedBg] = useState("FlagOklahoma.png");
  const [customImages, setCustomImages] = useState([]);
  const [positions, setPositions] = useState(defaultPositions);
  const [styles, setStyles] = useState(defaultStyles);

  const [vars, setVars] = useState({
    callsign: "KJ5LVN",
    operatorName: "David",
    qth: "Sapulpa, Oklahoma",
    grid: "EM25",
    ituZone: "7",
    cqZone: "4",
    dateUTC: utc.date,
    timeUTC: utc.time,
    frequency: "446.500",
    band: "70cm",
    mode: "DMR",
    rst: "59",
    contactName: "W1AW",
    comments: "Thanks for the QSO! 73"
  });

  // Load background image - either from public folder or custom upload (data URL)
  const isCustomImage = selectedBg.startsWith('data:');
  const bg = useImage(isCustomImage ? selectedBg : process.env.PUBLIC_URL + "/" + selectedBg);

  const uploadCustomImage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const dataUrl = event.target.result;
          const newImage = { name: file.name, file: dataUrl };
          setCustomImages(prev => [...prev, newImage]);
          setSelectedBg(dataUrl);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const exportPNG = () => {
    const uri = stageRef.current.toDataURL({ pixelRatio: 2 });
    const a = document.createElement("a");
    a.href = uri;
    a.download = `eQSL_${vars.callsign}.png`;
    a.click();
  };

  const resetPositions = () => {
    setPositions(defaultPositions);
  };

  const saveTemplate = () => {
    const template = { vars, styles, positions, selectedBg };
    const json = JSON.stringify(template, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `eQSL_template_${vars.callsign}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const loadTemplate = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const template = JSON.parse(event.target.result);
            setVars(template.vars);
            setStyles(template.styles);
            setPositions(template.positions);
            setSelectedBg(template.selectedBg);
          } catch (err) {
            alert('Invalid template file.');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleDragEnd = (key, e) => {
    setPositions(prev => ({
      ...prev,
      [key]: { x: e.target.x(), y: e.target.y() }
    }));
  };

  const width = 1200, height = 600;
  const bgWidth = 1200, bgHeight = 600, bgX = 0, bgY = 0;
  const bgColor = "#1a1a2e";

  const buttonStyle = {
    backgroundColor: "#2d2d4a",
    color: "white",
    border: "1px solid #19f5ff",
    padding: "8px 16px",
    borderRadius: 4,
    cursor: "pointer",
    marginRight: 8,
    marginBottom: 8,
  };

  const inputStyle = {
    width: "100%",
    padding: "4px 8px",
    borderRadius: 4,
    border: "1px solid #444",
    backgroundColor: "#2d2d4a",
    color: "white",
  };

  const labelStyle = {
    display: "block",
    fontSize: 12,
    color: "white",
    marginBottom: 2,
  };

  const sectionStyle = {
    marginBottom: 16,
    padding: 12,
    backgroundColor: "#252540",
    borderRadius: 8,
  };

  const colorInputStyle = {
    width: 40,
    height: 24,
    border: "none",
    borderRadius: 4,
    cursor: "pointer",
  };

  const sliderStyle = {
    width: 80,
  };

  // Station info fields
  const stationFields = ['callsign', 'operatorName', 'Location', 'grid', 'ituZone', 'cqZone'];
  // QSO detail fields
  const qsoFields = ['contactName', 'dateUTC', 'timeUTC', 'frequency', 'band', 'mode', 'rst', 'comments'];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 16, backgroundColor: bgColor, minHeight: "100vh", padding: 16 }}>
      <div>
        {/* Canvas with border/shadow */}
        <div style={{ boxShadow: "0 4px 20px rgba(25, 245, 255, 0.3)", borderRadius: 4, overflow: "hidden", border: "2px solid #19f5ff" }}>
          <Stage width={width} height={height} ref={stageRef} style={{ backgroundColor: bgColor }}>
            <Layer>
              {/* Background color */}
              <Rect x={0} y={0} width={width} height={height} fill={bgColor} />

              {/* Background image */}
              {bg && <KonvaImage
                image={bg}
                x={bgX}
                y={bgY}
                width={bgWidth}
                height={bgHeight}
              />}

              {/* Callsign */}
              <Text
                text={vars.callsign}
                x={positions.callsign.x}
                y={positions.callsign.y}
                fontSize={styles.callsignSize}
                fontFamily="Orbitron"
                fill={styles.callsignColor}
                draggable
                onDragEnd={(e) => handleDragEnd('callsign', e)}
              />

              {/* Operator + QTH */}
              <Text
                text={`${vars.operatorName} • ${vars.Location}`}
                x={positions.operatorQth.x}
                y={positions.operatorQth.y}
                fontSize={styles.operatorQthSize}
                fontFamily="Inter"
                fill={styles.operatorQthColor}
                draggable
                onDragEnd={(e) => handleDragEnd('operatorQth', e)}
              />

              {/* Grid Square */}
              <Text
                text={`Grid ${vars.grid}`}
                x={positions.grid.x}
                y={positions.grid.y}
                fontSize={styles.gridSize}
                fontFamily="Inter"
                fill={styles.gridColor}
                draggable
                onDragEnd={(e) => handleDragEnd('grid', e)}
              />

              {/* QSO Details */}
              <Text
                text={`QSO: ${vars.dateUTC} ${vars.timeUTC} UTC • ${vars.frequency} MHz • ${vars.band} • ${vars.mode} • RST ${vars.rst}`}
                x={positions.qsoDetails.x}
                y={positions.qsoDetails.y}
                width={1200}
                align="center"
                fontSize={styles.qsoDetailsSize}
                fontFamily="Inter"
                fill={styles.qsoDetailsColor}
                draggable
                onDragEnd={(e) => handleDragEnd('qsoDetails', e)}
              />

              {/* Zones */}
              <Text
                text={`ITU ${vars.ituZone} • CQ ${vars.cqZone}`}
                x={positions.zones.x}
                y={positions.zones.y}
                fontSize={styles.zonesSize}
                fontFamily="Inter"
                fill={styles.zonesColor}
                draggable
                onDragEnd={(e) => handleDragEnd('zones', e)}
              />

              {/* Contact Name */}
              <Text
                text={`Contact: ${vars.contactName}`}
                x={positions.contact.x}
                y={positions.contact.y}
                fontSize={styles.contactSize}
                fontFamily="Inter"
                fill={styles.contactColor}
                draggable
                onDragEnd={(e) => handleDragEnd('contact', e)}
              />

              {/* Comments */}
              {vars.comments && (
                <Text
                  text={vars.comments}
                  x={positions.comments.x}
                  y={positions.comments.y}
                  fontSize={styles.commentsSize}
                  fontFamily="Inter"
                  fill={styles.commentsColor}
                  draggable
                  onDragEnd={(e) => handleDragEnd('comments', e)}
                />
              )}
            </Layer>
          </Stage>
        </div>

        {/* Action Buttons */}
        <div style={{ marginTop: 12 }}>
          <button onClick={exportPNG} style={buttonStyle}>Export PNG</button>
          <button onClick={resetPositions} style={buttonStyle}>Reset Positions</button>
          <button onClick={saveTemplate} style={buttonStyle}>Save Template</button>
          <button onClick={loadTemplate} style={buttonStyle}>Load Template</button>
        </div>
      </div>

      {/* Variables Panel */}
      <div style={{ maxHeight: "100vh", overflowY: "auto" }}>
        {/* Background Selection */}
        <div style={sectionStyle}>
          <h3 style={{ color: "white", marginTop: 0 }}>Background Image</h3>
          <select
            value={selectedBg}
            onChange={(e) => setSelectedBg(e.target.value)}
            style={{ ...inputStyle, width: "100%", marginBottom: 8 }}
          >
            {backgroundImages.map(img => (
              <option key={img.file} value={img.file}>{img.name}</option>
            ))}
            {customImages.map((img, idx) => (
              <option key={`custom-${idx}`} value={img.file}>{img.name}</option>
            ))}
          </select>
          <button onClick={uploadCustomImage} style={{ ...buttonStyle, width: "100%", marginRight: 0 }}>
            Upload Custom Image
          </button>
        </div>

        {/* Station Info */}
        <div style={sectionStyle}>
          <h3 style={{ color: "white", marginTop: 0 }}>Station Info</h3>
          {stationFields.map(k => (
            <div key={k} style={{ marginBottom: 8 }}>
              <label style={labelStyle}>{k}</label>
              <input
                value={vars[k]}
                onChange={(e) => setVars({ ...vars, [k]: e.target.value })}
                style={inputStyle}
              />
            </div>
          ))}
        </div>

        {/* QSO Details */}
        <div style={sectionStyle}>
          <h3 style={{ color: "white", marginTop: 0 }}>QSO Details</h3>
          {qsoFields.map(k => (
            <div key={k} style={{ marginBottom: 8 }}>
              <label style={labelStyle}>{k}</label>
              <input
                value={vars[k]}
                onChange={(e) => setVars({ ...vars, [k]: e.target.value })}
                style={inputStyle}
              />
            </div>
          ))}
        </div>

        {/* Text Styles */}
        <div style={sectionStyle}>
          <h3 style={{ color: "white", marginTop: 0 }}>Text Styles</h3>

          {/* Callsign */}
          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>Callsign</label>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input
                type="color"
                value={styles.callsignColor}
                onChange={(e) => setStyles({ ...styles, callsignColor: e.target.value })}
                style={colorInputStyle}
              />
              <input
                type="range"
                min="24"
                max="150"
                value={styles.callsignSize}
                onChange={(e) => setStyles({ ...styles, callsignSize: Number(e.target.value) })}
                style={sliderStyle}
              />
              <span style={{ color: "white", fontSize: 12 }}>{styles.callsignSize}px</span>
            </div>
          </div>

          {/* Operator/QTH */}
          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>Operator/QTH</label>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input
                type="color"
                value={styles.operatorQthColor}
                onChange={(e) => setStyles({ ...styles, operatorQthColor: e.target.value })}
                style={colorInputStyle}
              />
              <input
                type="range"
                min="12"
                max="72"
                value={styles.operatorQthSize}
                onChange={(e) => setStyles({ ...styles, operatorQthSize: Number(e.target.value) })}
                style={sliderStyle}
              />
              <span style={{ color: "white", fontSize: 12 }}>{styles.operatorQthSize}px</span>
            </div>
          </div>

          {/* Grid */}
          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>Grid Square</label>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input
                type="color"
                value={styles.gridColor}
                onChange={(e) => setStyles({ ...styles, gridColor: e.target.value })}
                style={colorInputStyle}
              />
              <input
                type="range"
                min="12"
                max="72"
                value={styles.gridSize}
                onChange={(e) => setStyles({ ...styles, gridSize: Number(e.target.value) })}
                style={sliderStyle}
              />
              <span style={{ color: "white", fontSize: 12 }}>{styles.gridSize}px</span>
            </div>
          </div>

          {/* QSO Details */}
          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>QSO Details</label>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input
                type="color"
                value={styles.qsoDetailsColor}
                onChange={(e) => setStyles({ ...styles, qsoDetailsColor: e.target.value })}
                style={colorInputStyle}
              />
              <input
                type="range"
                min="12"
                max="48"
                value={styles.qsoDetailsSize}
                onChange={(e) => setStyles({ ...styles, qsoDetailsSize: Number(e.target.value) })}
                style={sliderStyle}
              />
              <span style={{ color: "white", fontSize: 12 }}>{styles.qsoDetailsSize}px</span>
            </div>
          </div>

          {/* Zones */}
          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>Zones</label>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input
                type="color"
                value={styles.zonesColor}
                onChange={(e) => setStyles({ ...styles, zonesColor: e.target.value })}
                style={colorInputStyle}
              />
              <input
                type="range"
                min="12"
                max="72"
                value={styles.zonesSize}
                onChange={(e) => setStyles({ ...styles, zonesSize: Number(e.target.value) })}
                style={sliderStyle}
              />
              <span style={{ color: "white", fontSize: 12 }}>{styles.zonesSize}px</span>
            </div>
          </div>

          {/* Contact */}
          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>Contact</label>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input
                type="color"
                value={styles.contactColor}
                onChange={(e) => setStyles({ ...styles, contactColor: e.target.value })}
                style={colorInputStyle}
              />
              <input
                type="range"
                min="18"
                max="96"
                value={styles.contactSize}
                onChange={(e) => setStyles({ ...styles, contactSize: Number(e.target.value) })}
                style={sliderStyle}
              />
              <span style={{ color: "white", fontSize: 12 }}>{styles.contactSize}px</span>
            </div>
          </div>

          {/* Comments */}
          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>Comments</label>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input
                type="color"
                value={styles.commentsColor}
                onChange={(e) => setStyles({ ...styles, commentsColor: e.target.value })}
                style={colorInputStyle}
              />
              <input
                type="range"
                min="12"
                max="48"
                value={styles.commentsSize}
                onChange={(e) => setStyles({ ...styles, commentsSize: Number(e.target.value) })}
                style={sliderStyle}
              />
              <span style={{ color: "white", fontSize: 12 }}>{styles.commentsSize}px</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
