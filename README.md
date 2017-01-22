dfv-prototype
=============

Domain Flow Visualization: experimenting with different GUI organizations and relationships


dfv-prototype is an experiment to create a web application of an IDE for Domain Flow Algorithms.

# Goals

+ to experiment with the design, debug, and optimization of domain flow algorithms
+ to discover the most productive visualizations to capture the execution dynamics of parallel algorithms
+ to discover the most productive representations to design and tune chains of domain flow algorithms
+ integrate a JS compiler for the Domain Flow language and connect the update events to viz and debug 
+ to experiment with the design, debug, and optimization of the Stillwater KPU

Read more at http://www.stillwater-sc.com/tour.html

# Getting started

Right now the prototype is just a handrolled web page calling JS libraries to create the first visualizations.
Simply open the domain-flow.html page to experiment with the raw components.

Inspired by JSFiddle and CodePen, we want to wrap this into a Polymer-Redux stack to create a productive environment in which
the community can collaborative design and fine-tune complex domain flow programs. To execute domain flow programs,
we will create a run-time that allows software emulation, but the end goal is to create a WebGL-like stack for
hardware acceleration on a Stillwater KPU platform.
