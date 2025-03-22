import React from 'react';
import './Learning.css';

const Learning = () => {
  return (
    <div className="learning-container">
      <div className="learning-header">
        <h1 className="learning-title">Learning Resources</h1>
        <p className="learning-subtitle">
          Explore our comprehensive collection of resources to enhance your programming skills
        </p>
      </div>

      <div className="learning-sections">
        <div className="learning-section">
          <h2 className="section-title">Data Structures</h2>
          <ul className="resource-list">
            <li className="resource-item">
              <span className="resource-icon">📊</span>
              <div className="resource-content">
                <h3>Arrays and Strings</h3>
                <p>Learn about fundamental data structures for storing collections of elements</p>
              </div>
            </li>
            <li className="resource-item">
              <span className="resource-icon">🔄</span>
              <div className="resource-content">
                <h3>Linked Lists</h3>
                <p>Master the implementation and operations of singly and doubly linked lists</p>
              </div>
            </li>
            <li className="resource-item">
              <span className="resource-icon">🌲</span>
              <div className="resource-content">
                <h3>Trees and Graphs</h3>
                <p>Understand hierarchical data structures and their traversal algorithms</p>
              </div>
            </li>
            <li className="resource-item">
              <span className="resource-icon">📚</span>
              <div className="resource-content">
                <h3>Stacks and Queues</h3>
                <p>Explore LIFO and FIFO data structures and their applications</p>
              </div>
            </li>
          </ul>
        </div>

        <div className="learning-section">
          <h2 className="section-title">Algorithms</h2>
          <ul className="resource-list">
            <li className="resource-item">
              <span className="resource-icon">🔍</span>
              <div className="resource-content">
                <h3>Searching Algorithms</h3>
                <p>Learn binary search, linear search, and other efficient searching techniques</p>
              </div>
            </li>
            <li className="resource-item">
              <span className="resource-icon">📋</span>
              <div className="resource-content">
                <h3>Sorting Algorithms</h3>
                <p>Master quicksort, mergesort, heapsort, and analyze their time complexities</p>
              </div>
            </li>
            <li className="resource-item">
              <span className="resource-icon">🧩</span>
              <div className="resource-content">
                <h3>Dynamic Programming</h3>
                <p>Solve complex problems by breaking them down into simpler subproblems</p>
              </div>
            </li>
            <li className="resource-item">
              <span className="resource-icon">📈</span>
              <div className="resource-content">
                <h3>Graph Algorithms</h3>
                <p>Implement BFS, DFS, Dijkstra's algorithm, and minimum spanning trees</p>
              </div>
            </li>
          </ul>
        </div>

        <div className="learning-section">
          <h2 className="section-title">Programming Languages</h2>
          <ul className="resource-list">
            <li className="resource-item">
              <span className="resource-icon">🐍</span>
              <div className="resource-content">
                <h3>Python</h3>
                <p>Learn Python from basics to advanced concepts with practical examples</p>
              </div>
            </li>
            <li className="resource-item">
              <span className="resource-icon">☕</span>
              <div className="resource-content">
                <h3>Java</h3>
                <p>Master object-oriented programming with Java and its ecosystem</p>
              </div>
            </li>
            <li className="resource-item">
              <span className="resource-icon">⚡</span>
              <div className="resource-content">
                <h3>JavaScript</h3>
                <p>Explore modern JavaScript for web development and beyond</p>
              </div>
            </li>
            <li className="resource-item">
              <span className="resource-icon">🔧</span>
              <div className="resource-content">
                <h3>C++</h3>
                <p>Dive into C++ for high-performance computing and competitive programming</p>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <div className="learning-cta">
        <h2>Ready to start learning?</h2>
        <p>Access our complete library of tutorials, videos, and interactive exercises</p>
        <button className="cta-button">Explore All Resources</button>
      </div>
    </div>
  );
};

export default Learning;