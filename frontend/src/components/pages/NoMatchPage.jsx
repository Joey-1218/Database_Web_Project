import React, { memo } from "react"
import { Link } from "react-router";

function NoMatchPage() {
    return (
        <div>
            <h1>That's a 404.</h1>
            <p>Uh oh, looks like you're lost!</p>
            <p>
                <Link to="/">Back to safety.</Link>
            </p>
        </div>
    );
}

export default NoMatchPage;
