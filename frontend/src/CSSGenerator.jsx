
import { useState } from "react";
import "./CSSGenerator.css";

const defaultSettings = {
  theme: "light",
  background: "#f7f7f3",
  surface: "#ffffff",
  text: "#20231f",
  accent: "#d6f36a",
  accentSoft: "#e8eddb",
  button: "#252b20",
  buttonText: "#ffffff",
  border: "#ecece5",
  font: "'DM Sans', sans-serif",
  fontSize: "16px"
};

const darkSettings = {
  theme: "dark",
  background: "#171a18",
  surface: "#242925",
  text: "#f2f4ed",
  accent: "#b7d85a",
  accentSoft: "#34402c",
  button: "#b7d85a",
  buttonText: "#171a18",
  border: "#3a423b",
  font: "'DM Sans', sans-serif",
  fontSize: "16px"
};

function CSSGenerator() {
  const [settings, setSettings] = useState(defaultSettings);

  function updateSetting(key, value) {
    setSettings((previous) => ({
      ...previous,
      [key]: value,
      theme: "custom"
    }));
  }

  function selectTheme(theme) {
    if (theme === "light") {
      setSettings(defaultSettings);
    } else if (theme === "dark") {
      setSettings(darkSettings);
    }
  }

  const generatedCSS = `
:root {
  --site-bg: ${settings.background};
  --surface-color: ${settings.surface};
  --text-color: ${settings.text};
  --accent-color: ${settings.accent};
  --accent-soft: ${settings.accentSoft};
  --button-color: ${settings.button};
  --button-text: ${settings.buttonText};
  --border-color: ${settings.border};
  --body-font: ${settings.font};
  --heading-font: 'Manrope', sans-serif;
  --base-font-size: ${settings.fontSize};
}
`;

  function applyCSS() {
    const root = document.documentElement;

    Object.entries({
      "--site-bg": settings.background,
      "--surface-color": settings.surface,
      "--text-color": settings.text,
      "--accent-color": settings.accent,
      "--accent-soft": settings.accentSoft,
      "--button-color": settings.button,
      "--button-text": settings.buttonText,
      "--border-color": settings.border,
      "--body-font": settings.font,
      "--base-font-size": settings.fontSize
    }).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });

    localStorage.setItem("shopshere-theme", JSON.stringify(settings));
  }

  function downloadCSS() {
    const blob = new Blob([generatedCSS], {
      type: "text/css"
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "shopshere-custom-theme.css";
    link.click();

    URL.revokeObjectURL(url);
  }

  return (
    <div className="css-generator">
      <div className="generator-heading">
        <div>
          <span className="admin-eyebrow">DESIGN CUSTOMIZATION</span>
          <h2>CSS Generator</h2>
          <p>Customize the appearance of your ShopShere website.</p>
        </div>
      </div>

      <div className="generator-layout">

        <section className="generator-controls">
          <h3>Theme Settings</h3>

          <label>Choose Theme</label>
          <select
            value={settings.theme === "custom" ? "custom" : settings.theme}
            onChange={(event) => selectTheme(event.target.value)}
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="custom">Custom</option>
          </select>

          <h3>Colors</h3>

          {[
            ["background", "Website Background"],
            ["surface", "Cards and Navbar"],
            ["text", "Text Color"],
            ["accent", "Accent Color"],
            ["accentSoft", "Hero Background"],
            ["button", "Button Color"],
            ["buttonText", "Button Text"],
            ["border", "Border Color"]
          ].map(([key, label]) => (
            <div className="color-control" key={key}>
              <label>{label}</label>
              <input
                type="color"
                value={settings[key]}
                onChange={(event) =>
                  updateSetting(key, event.target.value)
                }
              />
              <span>{settings[key]}</span>
            </div>
          ))}

          <h3>Typography</h3>

          <label>Font Family</label>
          <select
            value={settings.font}
            onChange={(event) =>
              updateSetting("font", event.target.value)
            }
          >
            <option value="'DM Sans', sans-serif">DM Sans</option>
            <option value="Arial, sans-serif">Arial</option>
            <option value="Georgia, serif">Georgia</option>
            <option value="'Trebuchet MS', sans-serif">
              Trebuchet MS
            </option>
            <option value="Verdana, sans-serif">Verdana</option>
          </select>

          <label>Font Size</label>
          <select
            value={settings.fontSize}
            onChange={(event) =>
              updateSetting("fontSize", event.target.value)
            }
          >
            <option value="14px">Small</option>
            <option value="16px">Medium</option>
            <option value="18px">Large</option>
            <option value="20px">Extra Large</option>
          </select>

          <div className="generator-buttons">
            <button onClick={applyCSS}>
              Apply Theme
            </button>

            <button onClick={downloadCSS}>
              Download CSS
            </button>

            <button
              className="reset-theme"
              onClick={() => selectTheme("light")}
            >
              Reset Theme
            </button>
          </div>
        </section>

        <section className="generator-preview">
          <h3>Live Preview</h3>

          <div
            className="preview-card"
            style={{
              background: settings.background,
              color: settings.text,
              fontFamily: settings.font,
              fontSize: settings.fontSize,
              borderColor: settings.border
            }}
          >
            <div
              className="preview-navbar"
              style={{
                background: settings.surface,
                borderColor: settings.border
              }}
            >
              <strong>ShopSphere</strong>
              <span>Preview Store</span>
            </div>

            <div
              className="preview-hero"
              style={{
                background: settings.accentSoft
              }}
            >
              <h2>Find something you'll love.</h2>
              <p>Your customized shopping experience.</p>
              <button
                style={{
                  background: settings.button,
                  color: settings.buttonText
                }}
              >
                Explore Now
              </button>
            </div>

            <div
              className="preview-product"
              style={{
                background: settings.surface,
                borderColor: settings.border
              }}
            >
              <span
                style={{ color: settings.accent }}
              >
                FEATURED PRODUCT
              </span>
              <h3>Sample Product</h3>
              <p>Product description appears here.</p>
              <strong>₹1,499</strong>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}

export default CSSGenerator;
