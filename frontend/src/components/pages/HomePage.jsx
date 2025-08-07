import React, { memo } from "react"
import imgSrc from "../../assets/CS-department.jpg"

export default function HomePage() {
  return (
    <div>
      <h1>Home</h1>
      <p>Welcome to Spotify Explorer Lite.</p>
      <img src={imgSrc} alt="image of CS department" width="1536" height="807"/>
    </div>
  );
}
