'use strict';
const content = `
how many bedrooms you need?
--if one, how many square feet?
----if between 1500 to 3000, do you want a swimming pool?
------if yes, SQL: select * from houses where num_of_bedrooms = 1  and square_feet > 1500 and square_feet < 3000 and swimming_pool = 'Y'; 
------if no, SQL: select * from houses where num_of_bedrooms = 1  and square_feet > 1500 and square_feet < 3000 and swimming_pool = 'N'; 
----if more than 3000, do you want a swimming pool?
------if yes, SQL: select * from houses where num_of_bedrooms = 1  and square_feet > 3000 and swimming_pool = 'Y'; 
------if no, SQL: select * from houses where num_of_bedrooms = 1  and square_feet > 3000 and swimming_pool = 'N'; 
--if two, how many square feet?
----if between 1500 to 3000, do you want a swimming pool?
------if yes, SQL: select * from houses where num_of_bedrooms = 2  and square_feet < 1500 and square_feet > 3000 and swimming_pool = 'Y'; 
------if no, SQL: select * from houses where num_of_bedrooms = 2  and square_feet < 1500 and square_feet > 3000 and swimming_pool = 'N'; 
----if more than 3000, do you want a swimming pool?
------if yes, SQL: select * from houses where num_of_bedrooms = 2  and square_feet > 3000 and swimming_pool = 'Y'; 
------if no, SQL: select * from houses where num_of_bedrooms = 2  and square_feet > 3000 and swimming_pool = 'N'; 
--if three, how many square feet?
----if between 1500 to 3000, do you want a swimming pool?
------if yes, SQL: select * from houses where num_of_bedrooms = 3  and square_feet < 1500 and square_feet > 3000 and swimming_pool = 'Y'; 
------if no, SQL: select * from houses where num_of_bedrooms = 3  and square_feet < 1500 and square_feet > 3000 and swimming_pool = 'N'; 
----if more than 3000, do you want a swimming pool?
------if yes, SQL: select * from houses where num_of_bedrooms = 3  and square_feet > 3000 and swimming_pool = 'Y'; 
------if no, SQL: select * from houses where num_of_bedrooms = 3  and square_feet > 3000 and swimming_pool = 'N'; 
`;




