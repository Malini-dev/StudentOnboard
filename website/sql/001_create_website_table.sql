-- Create the website demo requests table
CREATE TABLE website (
    id UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
    created_at DATETIME2 DEFAULT GETUTCDATE() NOT NULL,
    first_name NVARCHAR(100),
    last_name NVARCHAR(100),
    email NVARCHAR(255),
    phone NVARCHAR(20),
    institute_name NVARCHAR(255),
    students_count NVARCHAR(50),
    institute_type NVARCHAR(100)
);
GO
