import streamlit as st

#from thefuzz import fuzz, process
import csv
import pandas as pd
import numpy as np
import os
import json

## Import libraries and open CSV

def initialize_csv(csv_name):
  #print(os.path.isfile(csv_name))
  df_0 = pd.read_csv(csv_name)
  df = pd.DataFrame(df_0)
  #print(df.to_string())

  col1 = "Diagnosis/Presenting problem"
  col2 = "Specific Factors 1"
  col3 = "Specific Factors 2"
  col4 = "Admitting Service"
  col5 = "Notes"
  col6 = "System"
  col7 = "Mechanism"
  #print(df.columns)
  return(df, col1, col2, col3, col4, col5, col6, col7)

##Search functions
_ = '''
#CURRENTLY UNUSED
#function that will take the user input,df,specified row to search in to match userInput, and outputs a new df with top matches (highest ratio from fuzzy search)
def fuzzysearch(userInput, df, r, top1 = False):

  #compute a ratio between user input and "text" column of df (block of code that I copy pasted from below)
  c = []
  for index, row in df.iterrows():
      b = ''.join(str(x) for x in row[r])
      c.append ([index,fuzz.token_set_ratio(userInput,b),b])

  cT = np.array(c).T
  #df['ratio'] = list(map(int, cT[1]))
  df.loc[:, 'ratio'] = list(map(int, cT[1])) #changed the above line to this line due to warning messages

  max_ratio = df["ratio"].max() #finds the best match

  #sub1.iloc[0:0]
  if top1: #if top1 is True (specified in the parameters)
    sub1 = df.loc[df['ratio'] == max_ratio]
  else: #default: if top1 is not specified in the parameters as True, the default will return a table w max ratio-5
    sub1 = df.loc[df['ratio'] >= (max_ratio - 5)] #subtable with the best ratios (anything that's >= max-5)

  return sub1

'''

#function that will take the user input,df,specified row to search in to match userInput, and outputs a new df with top matches (highest ratio from fuzzy search)
def explicitSearch(userInput, df, r):
    #No selection will show all possible options in the category
    if userInput == "no selection":
        sub1 = df
    #Other will show only items with no explicit tag in this category (ie. no tagged system/mechanism depedning which you are searching)
    elif userInput == "other" or userInput == "systemic":
        mask = df[r].str.find("")
        mask = mask.replace(np.NaN,True)
        mask = mask.replace(0,False)
        sub1 = df[mask]
        sub1.to_csv("sub1_content.csv")
    #Otherwise, explicitly search for the exact term used, since the user is selecting using a drop-down, so we know the spelling/phrasing etc.
    else:
        mask = df[r].str.contains(userInput,regex=False)
        #print(mask)
        mask = mask.replace(np.NaN,False)

        sub1 = df[mask]
        sub1.to_csv("sub1_content.csv")
    return sub1

def selection_to_string(selection, labels, fancy_labels):
    try:
        # Find the index of search_string in list1
        index = fancy_labels.index(selection)
        
        # Return the value from list2 at the found index
        return labels[index]
    
    except ValueError:
        # search_string is not found in list1
        return None
    
    except IndexError:
        # The index is out of range for list2
        return None


##MAIN
#Incoporates code from Robert et. Al <3
#Calls initialize_csv function and assigns the output values
df, col1, col2, col3, col4, col5, col6, col7 = initialize_csv('Admit_table_wCat_csv.csv')


#Compresses the text contents from all the columns of the dataframe into a list with one column, comma seperated text
##This will be what we fuzzy search into
df['text'] = df[[col1, col2, col3, col4, col5	]].astype(str).values.tolist()

# Converts col1 of the dataframe to a list, then converts to set to remove duplicates, then converts back to list to pass to classifier
labels = list(set(df[col1].tolist()))

# Import initial button categories from categories.json
cat_file = open("categories.json")
categories = json.load(cat_file)
system_labels = categories["system"]
mechanism_labels = categories["mechanism"]
system_labels_fancy = categories["system fancy"]
mechanism_labels_fancy = categories["mechanism fancy"]

#system_labels.insert(0, "no selection")
#system_labels.insert(-1, "systemic")
#mechanism_labels.insert(0, "no selection")
#mechanism_labels.insert(-1, "other")

_ = """
system_selection = parse_user("Please select from the following systems:\n" + str(system_labels))
mechanism_selection = parse_user("Please select from the following mechanisms:\n" + str(mechanism_labels))

sub0_sys = explicitSearch(system_selection, df, col6)
sub0_mech = explicitSearch(mechanism_selection, sub0_sys, col7)


prompt1 = parse_user("What is the presenting problem? Please use the shortest descriptor possible.")
ratios = []

sub1 = fuzzysearch(prompt1,sub0_mech,"text")

#asking the user to choose best match
prompt2 = parse_user("Which of the following categories is most likely?", list(set(sub1[col1].tolist())))

sub2 = fuzzysearch(prompt2,sub1,col1,True)

if sub2.shape[0] == 1:
  print("Admitting service: " + str(sub2[col4].values[:]))

##ADD another layer of search with the first subset column
#this is not done yet
else:
  sf1 = sub2[col2]
  sf2 = sub2[col3]
  #print(sf1)
  #print(sf2)

  if not sf1.isnull().all(): #check if specifying factor 1 is empty or not, if it is, goes on to see if there are any specifying factor 2
    prompt_sf1 = parse_user("Please choose a specifying factor", list(set(sf1.tolist())))
    sub3 = fuzzysearch(prompt_sf1, sub2, col2)
    print(sub3)

  elif not sf2.isnull().all():
    prompt_sf2 = parse_user("Please choose a specifying factor", list(set(sf2.tolist())))
    sub3 = fuzzysearch(prompt_sf2, sub2, col3)
    print(sub3)

  else: #if no specifying factor, list all possible admitting services
    print("\nAdmitting services: " + str(sub2[col4].values[:])) #prints all the possible admitting services if there are no specific factors 1 and 2
"""



##RENDER
st.title("Emergency Room Admission Algorithm:")

_ = """ with st.form("my_form"):
   st.write("**Form container:**")

   #mechanism_selection = st.multiselect('Pick a mechanism', system_labels)
   #system_selection = st.multiselect('Pick a system', mechanism_labels)
   mechanism_selection = st.selectbox('Pick a mechanism', system_labels)
   system_selection = st.selectbox('Pick a system', mechanism_labels)
   #manual = st.text_input("Manual Search")
   st.form_submit_button('Submit my picks') """

with st.container(border = True):
    column1, column2 = st.columns(2)

    #system_selection = column1.selectbox('Pick a system', system_labels, index=0)
    #mechanism_selection = column2.selectbox('Pick a mechanism',mechanism_labels, index=0)
    system_selection = selection_to_string(column1.radio('**Pick a system**', system_labels_fancy, index=0), system_labels, system_labels_fancy)
    mechanism_selection = selection_to_string(column2.radio('**Pick a mechanism**',mechanism_labels_fancy, index=0), mechanism_labels, mechanism_labels_fancy)

    # This is outside the form
    #st.write("Mechanism: ",mechanism_selection)
    #st.write("System:", system_selection)
    #st.write("\n\n")
    #st.write("Manual search: ", manual)

    sub0_sys = explicitSearch(system_selection, df, col6)
    sub0_mech = explicitSearch(mechanism_selection, sub0_sys, col7)

    #st.write(sub0_mech) 

    #Get button list from sub0_mech
    working_labels = list(set(sub0_mech[col1].tolist()))
    

with st.container(border = True):
    #prompt1 = st.selectbox('Pick a problem', working_labels)
    prompt1 = st.radio('**Pick a problem**', working_labels)

    _ = """
    with st.container():
        message = st.chat_message("assistant")
        message.write("What is the presenting problem? Please use the shortest descriptor possible.")
        prompt1 = st.chat_input("User input")

        st.write("\n", prompt1)
    """

    #sub1 = fuzzysearch(prompt1,sub0_mech,"text")
    if prompt1:
        sub1 = explicitSearch(prompt1, sub0_mech, col1)
        #st.write(sub1)
    else:
        sub1 = sub0_mech
        st.subheader("No results match this search, please try another selection.")

    working_SF1 = list(set(sub1[col2].tolist()))

    if any(sub1[col2].apply(lambda x: isinstance(x, str) and x.strip() != '') if sub1[col2].dtype == 'O' else sub1[col2].notna()):
        #prompt2 = st.selectbox('Pick a category', working_SF1)
        prompt2 = st.radio('**Pick a category**', working_SF1)
        if prompt2:
            sub2 = explicitSearch(prompt2, sub1, col2)
            #st.write(sub2)

    else:

        sub2 = sub1
        #st.write(sub2)

    working_SF2 = list(set(sub2[col3].tolist()))

    if any(sub2[col3].apply(lambda x: isinstance(x, str) and x.strip() != '') if sub2[col3].dtype == 'O' else sub2[col3].notna()):
        #prompt3 = st.selectbox('Pick a specific category', working_SF2)
        prompt3 = st.radio('**Pick a specific category**', working_SF2)
        if prompt3:
            sub3 = explicitSearch(prompt3, sub2, col3)
            #st.write(sub3)
    else:
        sub3 = sub2
        #st.write(sub3)

config = {"Admitting Service": st.column_config.TextColumn(width="large"), "Notes": st.column_config.TextColumn(width="large")}

with st.container(border = True):
    st.subheader("Recommended admitting service:")
    st.dataframe(sub3, hide_index = True, column_order = (col4, col5), use_container_width=True, column_config=config)


with st.container(border = True):
    st.subheader("Feedback:")
    agree = st.radio('**Do you agree with the admitting service proposed?**', ["Yes", "No"])
    if agree == "No":
        comment = st.text_input("**Comments**")

submitted = st.button("Submit")

if submitted:
    #write to csv
    #[system_selection, mechanism_selection, prompt1, prompt2, prompt3, agree, comment]
    x = True





_ = """
Set-like
def dataframe_to_setlike(df):
    # Group by the first column and aggregate the other columns
    aggregated_df = df.groupby(df.columns[0]).agg(lambda x: ', '.join(x.astype(str).unique()))
    
    return aggregated_df.reset_index()

# Applying the function
sub1_setlike = dataframe_to_setlike(sub1)

# Display the unique DataFrame
st.write(sub1_setlike)
"""



