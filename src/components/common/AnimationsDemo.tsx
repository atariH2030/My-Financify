/**
 * @file AnimationsDemo.tsx
 * @description Demonstração do sistema de animações com Framer Motion
 * @version 2.4.0
 * @author DEV - Rickson (TQM)
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  fadeInUp,
  fadeInLeft,
  fadeInRight,
  scaleIn,
  bounceIn,
  rotateIn,
  listContainer,
  listItem,
  buttonTap,
  notificationSlide,
  collapse,
} from '../../utils/animations';
import Button from './Button';
import Card from './Card';
import './AnimationsDemo.css';

export const AnimationsDemo: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [showList, setShowList] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [notifications, setNotifications] = useState<string[]>([]);

  const items = ['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5'];

  const addNotification = () => {
    const id = Date.now().toString();
    setNotifications((prev) => [...prev, id]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n !== id));
    }, 3000);
  };

  return (
    <div className="animations-demo">
      <h1>Demonstração de Animações - Framer Motion</h1>

      {/* Fade In Variants */}
      <section className="demo-section">
        <h2>Fade In Animations</h2>
        <div className="demo-grid">
          <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            className="demo-box"
          >
            <p>Fade In Up</p>
          </motion.div>

          <motion.div
            variants={fadeInLeft}
            initial="initial"
            animate="animate"
            className="demo-box"
          >
            <p>Fade In Left</p>
          </motion.div>

          <motion.div
            variants={fadeInRight}
            initial="initial"
            animate="animate"
            className="demo-box"
          >
            <p>Fade In Right</p>
          </motion.div>
        </div>
      </section>

      {/* Scale & Special Effects */}
      <section className="demo-section">
        <h2>Scale & Special Effects</h2>
        <div className="demo-grid">
          <motion.div
            variants={scaleIn}
            initial="initial"
            animate="animate"
            className="demo-box"
          >
            <p>Scale In</p>
          </motion.div>

          <motion.div
            variants={bounceIn}
            initial="initial"
            animate="animate"
            className="demo-box"
          >
            <p>Bounce In</p>
          </motion.div>

          <motion.div
            variants={rotateIn}
            initial="initial"
            animate="animate"
            className="demo-box"
          >
            <p>Rotate In</p>
          </motion.div>
        </div>
      </section>

      {/* Interactive Hover & Tap */}
      <section className="demo-section">
        <h2>Interactive Animations</h2>
        <div className="demo-grid">
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
            className="demo-card"
          >
            <Card title="Hover me!">
              <p>Este card tem animação de hover</p>
            </Card>
          </motion.div>

          <motion.div {...buttonTap} className="demo-card">
            <Button onClick={() => console.log('Clicked!')}>
              Click me! (Tap Animation)
            </Button>
          </motion.div>

          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{
              duration: 1.5,
              ease: 'easeInOut',
              repeat: Infinity,
            }}
            className="demo-badge"
          >
            <span className="badge">3</span>
            <p>Pulse Badge</p>
          </motion.div>
        </div>
      </section>

      {/* List Stagger */}
      <section className="demo-section">
        <h2>List Stagger Animation</h2>
        <Button onClick={() => setShowList(!showList)}>
          {showList ? 'Esconder' : 'Mostrar'} Lista
        </Button>

        <AnimatePresence>
          {showList && (
            <motion.ul
              variants={listContainer}
              initial="initial"
              animate="animate"
              exit="exit"
              className="demo-list"
            >
              {items.map((item) => (
                <motion.li key={item} variants={listItem} className="demo-list-item">
                  {item}
                </motion.li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </section>

      {/* Collapse/Expand */}
      <section className="demo-section">
        <h2>Collapse/Expand Animation</h2>
        <Button onClick={() => setIsExpanded(!isExpanded)}>
          {isExpanded ? 'Recolher' : 'Expandir'}
        </Button>

        <motion.div
          animate={isExpanded ? 'expanded' : 'collapsed'}
          variants={collapse}
          className="demo-collapsible"
        >
          <Card>
            <p>Este é um conteúdo expansível com animação suave.</p>
            <p>Você pode usar isso para acordeões, FAQs, e muito mais!</p>
          </Card>
        </motion.div>
      </section>

      {/* Notifications */}
      <section className="demo-section">
        <h2>Notification Slide Animation</h2>
        <Button onClick={addNotification}>Adicionar Notificação</Button>

        <div className="notifications-container">
          <AnimatePresence>
            {notifications.map((id) => (
              <motion.div
                key={id}
                variants={notificationSlide}
                initial="initial"
                animate="animate"
                exit="exit"
                className="notification"
              >
                <p>Nova notificação #{id.slice(-4)}</p>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </section>

      {/* Modal Example */}
      <section className="demo-section">
        <h2>Modal Animation</h2>
        <Button onClick={() => setShowModal(true)}>Abrir Modal</Button>

        <AnimatePresence>
          {showModal && (
            <>
              <motion.div
                className="modal-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowModal(false)}
              />
              <motion.div
                className="modal-content"
                variants={scaleIn}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <Card title="Modal Animado">
                  <p>Este modal usa animações de scale in/out</p>
                  <Button onClick={() => setShowModal(false)}>Fechar</Button>
                </Card>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </section>
    </div>
  );
};
