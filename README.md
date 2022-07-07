<h1>Connect4</h1>

<a href="https://connect4-mag.herokuapp.com/"> Link </a> 

Connect 4 game using CSS and vanilla javascript.

<img src="https://user-images.githubusercontent.com/17533749/174474610-c16c7dba-4d7e-471f-b84a-c4a1519157ad.png" width="800">

<h2>Overview</h2>

A Connect 4 game that lets a user play single player with the computer or multiplayer with another human. 
For single player games an attempt was made to prevent the game from being too easy by letting the 
program spot easy wins for itself and obvious threats from the player and act accordingly. 


<h2>Approach Taken</h2>
I decided to create a 'space' node for each space a token could be placed in and give each node position identifiers and properties based on its state. 
Eg 'red', 'yellow',  or 'empty'. I placed each node in an array and used CSS to structure it like a board to the user with 7 columns and 6 rows. 

After each move there is a check for wins, which could be vertical, horizontal, and two directions in the diagonal. 

As stated in the overview an attempt was made to make the program play somewhat 'intelligently', at least to stop the game from being far too easy, 
which would lead to a dull experience for the player. I used much of the functionality that checked for wins and used them to check for threats and 
opportunities - for example if the player has a vertical connect three and there are no other detected threats or opportunities, the program will place its token to as to block a connect 4.


![image](https://user-images.githubusercontent.com/17533749/174474707-b4b9ee60-7094-4e44-81d9-a995d2233416.png)

<h2>Wins and Blockers</h2>
I was happy to be able to show the 'length' of the win when the player or computer plays the game by highlighting the tokens that made up the 
connect, as the win may be connect 4, 5, or 6 or more. I enjoyed being able to make the program make good decisions in some situations that 
made the game more fun.
<br><br>
I suspect there is a better way I could check each space for wins or connects that would be helpful when trying to improve the programs' move calculator.
Giving the player difficulties to choose from and making the programs' playing abilities more sophisticated would be a clear direction
for improvement.






