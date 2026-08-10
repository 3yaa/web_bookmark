"use client";

import { motion, HTMLMotionProps, Variants } from "framer-motion";

const backdropVariants: Variants = {
	hidden: { opacity: 0 },
	// slightly ahead of the panel so the dim lands first and the panel glides
	// in against an already-settled background
	visible: { opacity: 1, transition: { duration: 0.32, ease: "easeOut" } },
	exit: { opacity: 0, transition: { duration: 0.18, ease: "easeIn" } },
};

// no scale, and a tween rather than a spring -- scaling a panel re-rasterises
// all its text and borders, so the whole thing visibly resettles when the
// transform lands on 1, and a spring's long tail delays that snap
const panelVariants: Variants = {
	hidden: { opacity: 0, y: 20 },
	visible: {
		opacity: 1,
		y: 0,
		transition: {
			// expo-out glides in and settles flat, so there is no long tail
			// creeping toward the target the way a spring has
			y: { duration: 0.52, ease: [0.16, 1, 0.3, 1] },
			// fades well ahead of the movement -- the panel is solid while it
			// is still easing the last few pixels, which reads as float
			opacity: { duration: 0.28, ease: "easeOut" },
		},
	},
	// nothing of its own on exit. the backdrop fades its whole subtree, so a
	// panel opacity here compounded with it -- the panel left on backdrop x
	// panel while siblings anchored beside it (the portrait island) left on
	// backdrop alone. same duration, different curve, permanently out of step
	exit: {},
};

export function ModalBackdrop(props: HTMLMotionProps<"div">) {
	return (
		<motion.div
			variants={backdropVariants}
			initial="hidden"
			animate="visible"
			exit="exit"
			{...props}
		/>
	);
}

export function ModalPanel(props: HTMLMotionProps<"div">) {
	return (
		<motion.div
			variants={panelVariants}
			initial="hidden"
			animate="visible"
			exit="exit"
			{...props}
		/>
	);
}
