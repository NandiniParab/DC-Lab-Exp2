import { motion } from 'framer-motion';


function Hello() {
    
    return (
        <>
            <div className = "h-screen bg-blue-500 flex justify-center items-center">
            <motion.div
        className="text-9xl font-blackjack text-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
      >
        hello ria
      </motion.div>
            </div>
        </>
        
    );
}

export default Hello;
