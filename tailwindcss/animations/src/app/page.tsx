import type { JSX } from "react";
import Transitions from "@/components/transitions";

export default function Home(): JSX.Element {
	return (
		<div className="test">
			<h1>Transitions</h1>
			<Transitions />
			<div className="test"></div>
		</div>
	);
}
