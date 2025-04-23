# Task-And-Time-Tracker
Task And Time Tracker

Assignment tile : Task and time Tracker for Teams(With Manager Approval)

Overviews 
		build a full stask and time tracker app for internal team
		employee log for their daily work and managers can review reject and accept those log.
		the portal have role based accees , validation rules and analytics
		
		
Tech stack :
		Backend : python django , dajango restframwork
		frontend : React
		Database : postgresql 
		
		
User roles :
	employee create (Crud operation), log tasks, view status, edit rejected
		Manager : views task Approved/Rejected , analytics , reporting 
		
		
Core Features :
		Athuntication and role base access 
		1. jwt based login , register
		2. role assigned at registartion or seeded
		3. access controlled based on role(only managere can approved)
		
Task Logging(Employee):
		1. employee can  log multiple task daily , specifying title, description and hours spent , associated tags, and task date 
		a system validation ensure that the toatl logged hours do not exceed 8 hours per day 
		each task start with pending status and is only editable still pending or rejected 
		the ui should clealy display status badge and preevent editing once task approved 
		
		
		2. log task oper day : title, description,  hours spent, tag , date
		3. Limit ; total hours 8 <_ 8 /day
		4. views /edit/delete their task.
		4. can not edit approved task.
		5. ui show status badge Pending, approved, Rejected
		
		
		
Task Aprroval workflows:
			Manager have access to views all submitted task by the assigned employee
			these task intially appear in  a pending state
			managere can either approved task  making them immutable or reject tem with optional comment 
			rejected task can be edited and resubmitted by employees reveting them topending state . this ensure a feedback loop between employees and managere and enforce accountibility and communication.
			1. all Employees are created task in pending .
			2.manager can approved or reject task (with optional comment)
			3. rejected task can be editable and can be resubmitted(status goes back to pending)


Manager Dahsboard:
		1. view team task 
		2. filter by date, employee, tag ,  status
		3. view state like  total hours , most used tags , pending approval 

Reports and analytics:
		1. Weekly progess per employee
		2. export csv download 
		3. filter by tag,  approval status, and total time.
