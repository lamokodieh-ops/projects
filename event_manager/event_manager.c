//Libraries used
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>

//Binary file for storing credentials
#define credentials_file "credentials.bin"
//Binary file for storing event data
#define event_file "events.bin"

// Structure for various events
typedef struct event{
    int year;
    int month;
    int day;
    char type[20];// anniversary,birthday etc.
    char category[20];// friend, family etc.
    char name[20];//name of the event
    struct event* next;
}event;

//Structure for storage of credentials
typedef struct credentials{
    char username[20];
    char password[20];
}credentials;


//FUNCTIONS

//Function for saving credentials if none exists
void save_credentials(credentials* cred){
FILE* file = fopen(credentials_file,"wb");
if(file == NULL){
    printf("\nError....\nCould not access credentials\n");
    return;
}
fwrite(cred,sizeof(credentials),1,file);
fclose(file);
}

//Function for checking if credentials already exist
int load_credentials(credentials* cred){
    FILE* file = fopen(credentials_file,"rb");
    if(file == NULL){
        return 0;
    }
    fread(cred,sizeof(credentials),1,file);//number of elements to be read is set to 1 because the application takes only 1 set of credentials
    fclose(file);
    return 1;
}
//Function for checking if credentials are correct and creating if there is none
int authenticate(){
    credentials cred;
    //attempting to load credentials, creating credentials if none found
    if(load_credentials(&cred)== 0){
        printf("\nSet up a new account\n");
        printf("Enter a username: \n");
        scanf("%s",cred.username);
        getchar();//getchar() is used after scanf to clear the new line character in the buffer to prevent errors when fgets is used
        printf("Enter a password: \n");
        scanf("%s",cred.password);
        getchar();
        save_credentials(&cred);
        printf("Account created.\nRestart program to log in.\n");
        return 0;
    }

    char username[20];
    char password[20];
    printf("Username: ");
    scanf("%s",username);
    getchar();
    printf("Password: ");
    scanf("%s", password);
    getchar();

    //comparing username and password for authentication
    if(strcmp(username,cred.username) == 0 && strcmp(password,cred.password) == 0){
        return 1;
    }
    else{
        printf("Incorrect username or password.\n");
        return 0;
    }
}

//Function for loading database
void load_database(event** head){
    FILE* file = fopen(event_file,"rb");
    if(file == NULL){
        printf("No events yet...");
        return;
    }

    event temp;
    while(fread(&temp,sizeof(event),1,file)){
    event* new_event= (event*)malloc(sizeof(event));
    if(new_event == NULL){
        printf("Memory allocation error");
        return;
    }
    *new_event=temp;
    new_event->next = *head;
    *head = new_event;
}
    fclose(file);
}

//Function for saving database
void save_database(event* head){
    FILE* file = fopen(event_file,"wb");
    if(file == NULL){
        printf("\nError....\nCould not save database\n");
        return;
    }
    event* current = head;
    while(current){
    fwrite(current,sizeof(event),1,file);
    current = current->next;
    }
    fclose(file);
}

//Function for adding an event
void add_event(event** head){
    event* new_event = (event*)malloc(sizeof(event));
    if(new_event == NULL){
        printf("Memory allocation error");
        return;
    }

    printf("\nEnter year, month and day: ");
    scanf("%d %d %d",&new_event->year,&new_event->month,&new_event->day);
    getchar();//getchar() is used after scanf to clear the new line character in the buffer to prevent errors when fgets is used

    printf("\nEnter type of event(eg. birthday,anniversary etc.): ");
    fgets(new_event->type,20,stdin);
    new_event->type[strcspn(new_event->type,"\n")]= '\0';//Making the last character '\0' to end the string

    printf("\nEnter category of event(eg. family,friend etc.): ");
    fgets(new_event->category,20,stdin);
    new_event->category[strcspn(new_event->category,"\n")]= '\0';

    printf("\nEnter name of event: ");
    fgets(new_event->name,20,stdin);
    new_event->name[strcspn(new_event->name,"\n")]= '\0';

    new_event->next = *head;
    *head = new_event;
    printf("\nEvent added.\n");
}


//Function for editing an event
void edit_event(event* head){
    char name[20];

    printf("\nEnter the name of the event to edit: ");
    fgets(name, sizeof(name) , stdin);//since it is a string of characters, sizeof gives the number of characters
    name[strcspn(name, "\n")] = '\0';

    event* current = head;
    while (current) {
        if (strcmp(current->name, name) == 0) {
            printf("\nEditing event: '%s'.\n", name);

            printf("\nEnter new year, month, and day: ");
            scanf("%d %d %d", &current->year, &current->month, &current->day);
            getchar();//getchar() is used after scanf to clear the new line character in the buffer to prevent errors when fgets is used

            printf("\nEnter new type: ");
            fgets(current->type, sizeof(current->type), stdin);
            current->type[strcspn(current->type, "\n")] = '\0';

            printf("\nEnter new category: ");
            fgets(current->category, sizeof(current->category), stdin);
            current->category[strcspn(current->category, "\n")] = '\0';

            printf("\nEnter new name: ");
            fgets(current->name,sizeof(current->name), stdin);
            current->name[strcspn(current->name, "\n")] = '\0';

            printf("\nEvent updated.\n");
            return;
        }
        current = current->next;
    }
    printf("\nEvent not found.\n");
}

//Function for deleting an event
void delete_event(event** head){
    char name[20];

    printf("\nEnter the name of the event to delete: ");
    fgets(name, sizeof(name), stdin);
    name[strcspn(name, "\n")] = '\0';

    event* current = *head;
    event* prev = NULL;
    while (current) {
        if (strcmp(current->name, name) == 0) {
            if(prev){
                prev->next = current->next;
            }
            else {
                    *head = current->next;
            }
            free(current);
            printf("Event deleted.\n");
            return;
        }
        prev = current;
        current = current->next;
    }
    printf("Event not found.\n");
}

//Function for displaying an event based on category
void display_by_category(event* head){
    char category[20];

    printf("\nEnter category to display by:\n");
    fgets(category, sizeof(category), stdin);
    category[strcspn(category, "\n")] = '\0';

    event* current = head;
    printf("\nEvents in category '%s':\n\n", category);
    int check = 0;
    while (current) {
        if (strcmp(current->category, category) == 0) {
            if(printf("Event date: %04d-%02d-%02d\nEvent name: %s\nEvent type: %s\n\n", current->year, current->month, current->day, current->name, current->type)){
                check++;
            }
        }

        current = current->next;
    }
     if(check == 0){
            printf("No events found\n");
        }
}

//Function for displaying an event based on date
void display_by_date(event* head){
int year, month, day;

    printf("\nEnter date (YYYY MM DD): ");
    scanf("%d %d %d", &year, &month, &day);

    event* current = head;
    printf("\nEvents on %04d-%02d-%02d:\n\n", year, month, day);

    int check=0;//variable which is modified whenever an event is found and printed
    while (current) {
        if (current->year == year && current->month == month && current->day == day) {
            printf("Event name: %s\nEvent type: %s\nEvent category: %s\n\n", current->name, current->type, current->category);
            check++;
        }
        current = current->next;
    }
    if(check == 0){
        printf("\nNo events found\n");
    }
}


//Function for displaying recent and upcoming events
void display_recent(event* head){
 time_t t = time(NULL);
    struct tm now = *localtime(&t);

    event* current = head;
    printf("\nRecent and upcoming events:\n\n");
    int check=0;//variable which is modified whenever an event is found and printed
     while (current) {

        //When it is a month between two other months
        if(now.tm_mon != 0 && now.tm_mon != 11){
            if (((now.tm_year + 1900)== current->year)&&((now.tm_mon+1)==current->month||(now.tm_mon)==current->month||(now.tm_mon+2)==current->month)) {
                printf("Event date: %04d-%02d-%02d\nEvent name: %s\nEvent type: %s\nEvent category: %s\n\n", current->year, current->month, current->day, current->name, current->type, current->category);
                    check++;
            }
        }

       //When the month is January
        if(now.tm_mon == 0){
            if ((current->year==(now.tm_year + 1900) )&&((now.tm_mon+1)==current->month||(now.tm_mon+2)==current->month)) {
            printf("\nEvent date: %04d-%02d-%02d\nEvent name: %s\nEvent type: %s\nEvent category: %s\n\n", current->year, current->month, current->day, current->name, current->type, current->category);
                    check++;
            }
            else if((current->year == (now.tm_year + 1899))&&(current->month == 12)){
                printf("Event date: %04d-%02d-%02d\nEvent name: %s\nEvent type: %s\nEvent category: %s\n\n", current->year, current->month, current->day, current->name, current->type, current->category);
                    check++;
                    }
        }

     //When the month is December
        if(now.tm_mon == 11){
            if ((current->year ==(now.tm_year + 1900) )&&((now.tm_mon+1)==current->month||(now.tm_mon)==current->month)) {
            printf("Event date: %04d-%02d-%02d\nEvent name: %s\nEvent type: %s\nEvent category: %s\n\n", current->year, current->month, current->day, current->name, current->type, current->category);
                    check++;
            }
            else if((current->year == (now.tm_year + 1901))&&(current->month == 1)){
                printf("Event date: %04d-%02d-%02d\nEvent name: %s\nEvent type: %s\nEvent category: %s\n\n", current->year, current->month, current->day, current->name, current->type, current->category);
                    check++;
                    }
        }


 current = current->next;
}

    if(check == 0){
        printf("\nNo events found\n");
    }

}

//Function for freeing all allocated memory
void free_events(event* head){
    event* current;
    while(head){
        current = head;
        head = head->next;
        free(current);
    }
}

//Main program
int main(){
    event* events = NULL;
    if(authenticate()== 0){
        printf("Exiting.....");
        return 0;
    }

    load_database(&events);

    int choice;
    do{
        printf("\n\nEvent Management System\n1. Add event\n2. Edit event\n3. Delete event\n4. Display events by category\n5. Display events by date\n6. Display recent and upcoming events\n0. Save and Exit\n");
        printf("Enter command: ");
        scanf("%d", &choice);
        getchar();//getchar() is used after scanf to clear the new line character in the buffer to prevent errors when fgets is used

        switch(choice){
        case 1:
            add_event(&events);
            save_database(events);//the save_database function is used after every function that modifies data
            break;
         case 2:
            edit_event(events);
            save_database(events);
            break;
        case 3:
            delete_event(&events);
            save_database(events);
            break;
        case 4:
            display_by_category(events);
            break;
        case 5:
            display_by_date(events);
            break;
        case 6:
            display_recent(events);
            break;
        case 0:
            printf("\nThank you for using the Event Management System\nExiting...\n");
            save_database(events);
            free_events(events);
            break;
        default:
            printf("\nInvalid command\n.");
            }
    }while (choice != 0);

return 0;
}
