"use client";

import { motion, HTMLMotionProps, Variants } from "framer-motion";

const backdropVariants: Variants = {
	hidden: { opacity: 0 },
	visible: { opacity: 1, transition: { duration: 0.28, ease: "easeOut" } },
	exit: { opacity: 0, transition: { duration: 0.2, ease: "easeIn" } },
};

const panelVariants: Variants = {
	hidden: { opacity: 0, scale: 0.96, y: 12 },
	visible: {
		opacity: 1,
		scale: 1,
		y: 0,
		transition: { type: "spring", stiffness: 260, damping: 24, mass: 0.9 },
	},
	exit: {
		opacity: 0,
		scale: 0.97,
		y: 8,
		transition: { duration: 0.18, ease: "easeIn" },
	},
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
