import React, { useRef, useState } from "react";
import "./search-bar.css";
import { Col, Form, FormGroup } from "reactstrap";

const SearchBar = ({ onContentUpdate }) => {
  const locationRef = useRef(null);
  const distanceRef = useRef(null);
  const maxGroupSizeRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const searchHandler = async (e) => {
    e.preventDefault();

    const location = locationRef.current.value;
    const distance = distanceRef.current.value;
    const maxGroupSize = maxGroupSizeRef.current.value;

    if (!location || !distance || !maxGroupSize) {
      setError("All fields are required");
      return;
    }

    setError(null);
    setIsLoading(true);

    const prompt = `Give a complete travel itinerary for a trip to ${location} for ${maxGroupSize} people within ${distance} INR`;

    try {
      await interactWithGeminiAPI(prompt);
    } finally {
      setIsLoading(false);
    }
  };

  const interactWithGeminiAPI = async (prompt) => {
    try {
      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=AIzaSyAqOH1aHX3CjMYQdXTjzmaUq9z2VuMjADw",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: prompt,
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 1024,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error("API request failed");
      }

      const result = await response.json();

      if (!result.candidates?.[0]?.content) {
        throw new Error("No content received");
      }

      onContentUpdate(result.candidates[0].content);
    } catch (error) {
      console.error("Error:", error);
      setError("Failed to fetch itinerary");
    }
  };

  return (
    <Col lg="12">
      <div className="search__bar">
        {error && <div className="error-message">{error}</div>}
        <Form className="d-flex align-items-center gap-4">
          <FormGroup className="d-flex gap-3 form__group form__group-fast">
            <span>
              <i className="ri-map-pin-line"></i>
            </span>
            <div>
              <h6>Location</h6>
              <input
                type="text"
                placeholder="Where are you going?"
                ref={locationRef}
                disabled={isLoading}
              />
            </div>
          </FormGroup>
          <FormGroup className="d-flex gap-3 form__group form__group-fast">
            <span>
              <i className="ri-map-pin-time-line"></i>
            </span>
            <div>
              <h6>Price</h6>
              <input
                type="number"
                placeholder="Price in INR"
                ref={distanceRef}
                disabled={isLoading}
              />
            </div>
          </FormGroup>
          <FormGroup className="d-flex gap-3 form__group form__group-fast">
            <span>
              <i className="ri-group-line"></i>
            </span>
            <div>
              <h6>Max People</h6>
              <input
                type="number"
                placeholder="0"
                ref={maxGroupSizeRef}
                disabled={isLoading}
              />
            </div>
          </FormGroup>

          <span
            className={`search__icon ${isLoading ? "disabled" : ""}`}
            onClick={searchHandler}
          >
            {isLoading ? (
              <i className="ri-loader-4-line spinning"></i>
            ) : (
              <i className="ri-search-line"></i>
            )}
          </span>
        </Form>
      </div>
    </Col>
  );
};

export default SearchBar;
