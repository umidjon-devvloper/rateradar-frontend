import { motion } from 'framer-motion';

const partners = [
  "Dendi Plaza", "Dendi Plaza", "Dendi Plaza", "Dendi Plaza", "Dendi Plaza", "Dendi Plaza",
];

export function MarqueePartners() {
  return (
    <div className="w-full overflow-hidden bg-muted/10 border-y py-8 mt-12 mb-8 flex flex-col items-center">
      <p className="text-sm font-medium text-muted-foreground mb-6 uppercase tracking-widest text-center">
        Bizga ishonch bildirgan mehmonxonalar
      </p>
      
      <div className="relative w-full max-w-[1400px] 2xl:max-w-[1600px] mx-auto overflow-hidden flex items-center">
        {/* Left/Right Fade Gradients */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-10" />
        
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{
            duration: 30,
            ease: "linear",
            repeat: Infinity,
          }}
          className="flex gap-16 md:gap-24 whitespace-nowrap items-center w-max pl-16 md:pl-24"
        >
          {/* Duplicate the array to create an infinite loop effect */}
          {[...partners, ...partners].map((partner, i) => (
            <div 
              key={i} 
              className="text-2xl md:text-3xl font-black text-muted-foreground/30 hover:text-muted-foreground/60 transition-colors duration-300"
              style={{ fontFamily: "serif" }}
            >
              {partner}
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
