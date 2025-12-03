"""
Enhanced Flow Diagram Generator for TCE EduRide Bus Tracking System
Generates professional flow diagrams as PNG images with improved styling
"""

import matplotlib.pyplot as plt
import matplotlib.patches as patches
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch, Circle, Rectangle
import numpy as np

# Set up professional styling
plt.rcParams['font.family'] = 'sans-serif'
plt.rcParams['font.size'] = 10
plt.rcParams['figure.facecolor'] = 'white'
plt.rcParams['axes.facecolor'] = 'white'

# Color palette
COLORS = {
    'start_end': '#4CAF50',      # Green
    'process': '#2196F3',         # Blue
    'decision': '#FFC107',        # Yellow/Amber
    'input_output': '#9C27B0',    # Purple
    'database': '#F44336',        # Red
    'admin': '#FFE082',           # Light yellow
    'student': '#90CAF9',         # Light blue
    'driver': '#A5D6A7',          # Light green
    'api': '#FFAB91',             # Light orange
    'border': '#263238'           # Dark blue-grey
}

def create_box(ax, x, y, width, height, text, color='#2196F3', text_color='white'):
    """Create a styled rounded box with text and shadow"""
    # Shadow
    shadow = FancyBboxPatch((x + 0.08, y - 0.08), width, height,
                           boxstyle="round,pad=0.15",
                           edgecolor='none',
                           facecolor='gray',
                           alpha=0.25,
                           zorder=1)
    ax.add_patch(shadow)
    
    # Main box
    box = FancyBboxPatch((x, y), width, height,
                         boxstyle="round,pad=0.15",
                         edgecolor=COLORS['border'],
                         facecolor=color,
                         linewidth=2.5,
                         zorder=2)
    ax.add_patch(box)
    
    # Text
    ax.text(x + width/2, y + height/2, text,
           ha='center', va='center',
           fontsize=10, weight='bold',
           color=text_color, wrap=True, zorder=3)

def create_diamond(ax, x, y, width, height, text, color='#FFC107'):
    """Create a diamond decision box with shadow"""
    # Shadow
    shadow = patches.Polygon([(x + width/2 + 0.08, y - 0.08), 
                              (x + width + 0.08, y + height/2 - 0.08),
                              (x + width/2 + 0.08, y + height - 0.08),
                              (x + 0.08, y + height/2 - 0.08)],
                             closed=True,
                             edgecolor='none',
                             facecolor='gray',
                             alpha=0.25,
                             zorder=1)
    ax.add_patch(shadow)
    
    # Diamond
    diamond = patches.Polygon([(x + width/2, y), 
                              (x + width, y + height/2),
                              (x + width/2, y + height),
                              (x, y + height/2)],
                             closed=True,
                             edgecolor=COLORS['border'],
                             facecolor=color,
                             linewidth=2.5,
                             zorder=2)
    ax.add_patch(diamond)
    
    ax.text(x + width/2, y + height/2, text,
           ha='center', va='center',
           fontsize=10, weight='bold',
           color='black', zorder=3)

def create_arrow(ax, x1, y1, x2, y2, label='', color='#263238'):
    """Create an arrow with optional label"""
    arrow = FancyArrowPatch((x1, y1), (x2, y2),
                           arrowstyle='->', mutation_scale=25,
                           linewidth=2.5, color=color,
                           zorder=2)
    ax.add_patch(arrow)
    if label:
        mid_x, mid_y = (x1 + x2) / 2, (y1 + y2) / 2
        ax.text(mid_x + 0.3, mid_y, label,
               fontsize=9, style='italic', weight='bold',
               bbox=dict(boxstyle='round,pad=0.4', facecolor='white', 
                        edgecolor=COLORS['border'], alpha=0.95, linewidth=1.5),
               zorder=3)

def create_cylinder(ax, x, y, width, height, text, color='#F44336'):
    """Create a cylinder shape for database"""
    # Cylinder body
    rect = Rectangle((x, y), width, height,
                    edgecolor=COLORS['border'], facecolor=color, 
                    linewidth=2.5, zorder=1)
    ax.add_patch(rect)
    
    # Top ellipse
    ellipse_top = patches.Ellipse((x + width/2, y + height), width/2, height*0.15,
                                 edgecolor=COLORS['border'], facecolor=color, 
                                 linewidth=2.5, zorder=2)
    ax.add_patch(ellipse_top)
    
    # Bottom ellipse
    ellipse_bottom = patches.Ellipse((x + width/2, y), width/2, height*0.15,
                                    edgecolor=COLORS['border'], facecolor=color, 
                                    linewidth=2.5, zorder=2)
    ax.add_patch(ellipse_bottom)
    
    ax.text(x + width/2, y + height/2, text,
           ha='center', va='center',
           fontsize=10, weight='bold', color='white', zorder=3)

# 1. User Authentication Flow
def generate_auth_flow():
    fig, ax = plt.subplots(figsize=(11, 13))
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 14)
    ax.axis('off')
    
    # Title with background
    title_box = Rectangle((0, 13), 10, 1, facecolor='#1976D2', edgecolor='none')
    ax.add_patch(title_box)
    ax.text(5, 13.5, 'USER AUTHENTICATION FLOW', 
           fontsize=18, weight='bold', ha='center', color='white')
    
    y = 12
    create_box(ax, 3.5, y, 3, 0.7, 'START', COLORS['start_end'], 'white')
    create_arrow(ax, 5, y, 5, y-0.9)
    
    y -= 1.2
    create_box(ax, 3, y, 4, 0.7, 'User Opens App', COLORS['process'], 'white')
    create_arrow(ax, 5, y, 5, y-0.9)
    
    y -= 1.2
    create_box(ax, 2.5, y, 5, 0.7, 'Select Role\n(Admin/Student/Driver)', COLORS['input_output'], 'white')
    create_arrow(ax, 5, y, 5, y-0.9)
    
    y -= 1.2
    create_box(ax, 2.5, y, 5, 0.7, 'Enter Credentials', COLORS['input_output'], 'white')
    create_arrow(ax, 5, y, 5, y-0.9)
    
    y -= 1.2
    create_box(ax, 3, y, 4, 0.7, 'Submit Login Request', COLORS['process'], 'white')
    create_arrow(ax, 5, y, 5, y-0.9)
    
    y -= 1.2
    create_box(ax, 2.5, y, 5, 0.7, 'Backend Validates', COLORS['api'], 'black')
    create_arrow(ax, 5, y, 5, y-0.9)
    
    y -= 1.2
    create_diamond(ax, 3.5, y, 3, 0.9, 'Valid?', COLORS['decision'])
    
    # Invalid path
    create_arrow(ax, 3.5, y+0.45, 1.5, y+0.45, 'No', '#F44336')
    create_box(ax, 0.2, y+0.1, 1.5, 0.7, 'Show Error', '#F44336', 'white')
    create_arrow(ax, 0.95, y+0.1, 0.95, y-1)
    create_arrow(ax, 0.95, y-1, 5, y-1)
    create_arrow(ax, 5, y-1, 5, y+3.5)
    
    # Valid path
    create_arrow(ax, 6.5, y+0.45, 8.5, y+0.45, 'Yes', '#4CAF50')
    create_box(ax, 7.8, y+0.1, 1.8, 0.7, 'Generate JWT', COLORS['api'], 'black')
    create_arrow(ax, 8.7, y+0.1, 8.7, y-0.7)
    
    create_box(ax, 7.5, y-1.4, 2.4, 0.7, 'Return Tokens', COLORS['api'], 'black')
    create_arrow(ax, 8.7, y-1.4, 8.7, y-2.3)
    create_arrow(ax, 8.7, y-2.3, 5, y-2.3)
    
    create_box(ax, 3, y-2.6, 4, 0.7, 'Store Tokens Locally', COLORS['process'], 'white')
    create_arrow(ax, 5, y-2.6, 5, y-3.5)
    
    create_box(ax, 2.5, y-4.2, 5, 0.7, 'Navigate to Dashboard', COLORS['start_end'], 'white')
    
    plt.tight_layout()
    plt.savefig('c:/Users/Venkatasai.Kommu/BP-Proj/report/diagrams/1_authentication_flow.png', 
                dpi=300, bbox_inches='tight', facecolor='white')
    plt.close()
    print("✓ Generated: 1_authentication_flow.png")

# 2. Real-Time Bus Tracking Flow
def generate_tracking_flow():
    fig, ax = plt.subplots(figsize=(13, 14))
    ax.set_xlim(0, 13)
    ax.set_ylim(0, 15)
    ax.axis('off')
    
    # Title
    title_box = Rectangle((0, 14), 13, 1, facecolor='#1976D2', edgecolor='none')
    ax.add_patch(title_box)
    ax.text(6.5, 14.5, 'REAL-TIME BUS TRACKING FLOW', 
           fontsize=18, weight='bold', ha='center', color='white')
    
    # Student Column
    ax.text(2, 13.3, 'STUDENT APP', fontsize=13, weight='bold', ha='center',
           bbox=dict(boxstyle='round,pad=0.5', facecolor=COLORS['student'], 
                    edgecolor=COLORS['border'], linewidth=2))
    
    y = 12.3
    create_box(ax, 0.8, y, 2.4, 0.6, 'Open Dashboard', COLORS['student'], 'black')
    create_arrow(ax, 2, y, 2, y-0.7)
    
    y -= 1
    create_box(ax, 0.6, y, 2.8, 0.6, 'View Assigned Bus', COLORS['student'], 'black')
    create_arrow(ax, 2, y, 2, y-0.7)
    
    y -= 1
    create_box(ax, 0.5, y, 3, 0.6, 'Request Location', COLORS['student'], 'black')
    create_arrow(ax, 2, y, 6.5, y)
    
    # Backend Column
    ax.text(6.5, 13.3, 'BACKEND API', fontsize=13, weight='bold', ha='center',
           bbox=dict(boxstyle='round,pad=0.5', facecolor=COLORS['api'], 
                    edgecolor=COLORS['border'], linewidth=2))
    
    y2 = 10.3
    create_box(ax, 5, y2, 3, 0.6, 'Verify JWT Token', COLORS['api'], 'black')
    create_arrow(ax, 6.5, y2, 6.5, y2-0.7)
    
    y2 -= 1
    create_box(ax, 4.5, y2, 4, 0.6, 'Query Bus Location', COLORS['api'], 'black')
    create_arrow(ax, 6.5, y2, 6.5, y2-0.7)
    
    y2 -= 1
    create_box(ax, 5, y2, 3, 0.6, 'Calculate ETA', COLORS['api'], 'black')
    create_arrow(ax, 6.5, y2, 6.5, y2-0.7)
    
    y2 -= 1
    create_box(ax, 4.5, y2, 4, 0.6, 'Return Data', COLORS['api'], 'black')
    create_arrow(ax, 6.5, y2, 2, y2)
    
    # Back to Student
    y3 = 6.3
    create_box(ax, 0.5, y3, 3, 0.6, 'Display on Map', COLORS['student'], 'black')
    create_arrow(ax, 2, y3, 2, y3-0.7)
    
    y3 -= 1
    create_box(ax, 0.6, y3, 2.8, 0.6, 'Show Bus Icon', COLORS['student'], 'black')
    create_arrow(ax, 2, y3, 2, y3-0.7)
    
    y3 -= 1
    create_box(ax, 0.8, y3, 2.4, 0.6, 'Show ETA', COLORS['student'], 'black')
    create_arrow(ax, 2, y3, 2, y3-0.7)
    
    y3 -= 1
    create_box(ax, 0.5, y3, 3, 0.6, 'Auto-Refresh Loop', COLORS['student'], 'black')
    create_arrow(ax, 0.5, y3+0.3, 0.2, y3+0.3)
    create_arrow(ax, 0.2, y3+0.3, 0.2, 10.3)
    create_arrow(ax, 0.2, 10.3, 0.5, 10.3)
    
    # Driver Column
    ax.text(10.5, 13.3, 'DRIVER APP', fontsize=13, weight='bold', ha='center',
           bbox=dict(boxstyle='round,pad=0.5', facecolor=COLORS['driver'], 
                    edgecolor=COLORS['border'], linewidth=2))
    
    yd = 12.3
    create_box(ax, 9.2, yd, 2.6, 0.6, 'Start Trip', COLORS['driver'], 'black')
    create_arrow(ax, 10.5, yd, 10.5, yd-0.7)
    
    yd -= 1
    create_box(ax, 9, yd, 3, 0.6, 'Enable GPS Tracking', COLORS['driver'], 'black')
    create_arrow(ax, 10.5, yd, 10.5, yd-0.7)
    
    yd -= 1
    create_box(ax, 8.8, yd, 3.4, 0.6, 'Capture Coordinates', COLORS['driver'], 'black')
    create_arrow(ax, 10.5, yd, 10.5, yd-0.7)
    
    yd -= 1
    create_box(ax, 8.8, yd, 3.4, 0.6, 'Send to Backend', COLORS['driver'], 'black')
    create_arrow(ax, 10.5, yd, 8.5, yd)
    
    # Loop
    yd -= 2
    create_diamond(ax, 9.5, yd, 2, 0.8, 'Trip\nActive?', COLORS['decision'])
    create_arrow(ax, 10.5, yd+0.8, 10.5, yd+1.5, 'Yes', '#4CAF50')
    create_arrow(ax, 10.5, yd+1.5, 12.5, yd+1.5)
    create_arrow(ax, 12.5, yd+1.5, 12.5, 10.3)
    create_arrow(ax, 12.5, 10.3, 12, 10.3)
    
    create_arrow(ax, 9.5, yd+0.4, 7.5, yd+0.4, 'No', '#F44336')
    create_box(ax, 6, yd, 1.5, 0.7, 'End Trip', '#F44336', 'white')
    
    plt.tight_layout()
    plt.savefig('c:/Users/Venkatasai.Kommu/BP-Proj/report/diagrams/2_bus_tracking_flow.png', 
                dpi=300, bbox_inches='tight', facecolor='white')
    plt.close()
    print("✓ Generated: 2_bus_tracking_flow.png")

# 3. Schedule Management Flow
def generate_schedule_flow():
    fig, ax = plt.subplots(figsize=(11, 13))
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 14)
    ax.axis('off')
    
    title_box = Rectangle((0, 13), 10, 1, facecolor='#1976D2', edgecolor='none')
    ax.add_patch(title_box)
    ax.text(5, 13.5, 'SCHEDULE MANAGEMENT FLOW', 
           fontsize=18, weight='bold', ha='center', color='white')
    
    y = 12
    create_box(ax, 3.5, y, 3, 0.7, 'Admin Login', COLORS['admin'], 'black')
    create_arrow(ax, 5, y, 5, y-0.9)
    
    y -= 1.1
    create_box(ax, 2.5, y, 5, 0.7, 'Navigate to Schedules', COLORS['admin'], 'black')
    create_arrow(ax, 5, y, 5, y-0.9)
    
    y -= 1.1
    create_diamond(ax, 3.5, y, 3, 0.9, 'Create or\nEdit?', COLORS['decision'])
    
    # Create path
    create_arrow(ax, 3.5, y+0.45, 1.8, y+0.45, 'Create')
    yc = y
    create_box(ax, 0.3, yc-0.3, 1.7, 0.6, 'Click Add', COLORS['process'], 'white')
    create_arrow(ax, 1.15, yc-0.3, 1.15, yc-1.1)
    
    yc -= 1.4
    create_box(ax, 0.3, yc, 1.7, 0.6, 'Select Bus', COLORS['input_output'], 'white')
    create_arrow(ax, 1.15, yc, 1.15, yc-0.8)
    
    yc -= 1.1
    create_box(ax, 0.3, yc, 1.7, 0.6, 'Select Route', COLORS['input_output'], 'white')
    create_arrow(ax, 1.15, yc, 1.15, yc-0.8)
    
    yc -= 1.1
    create_box(ax, 0.3, yc, 1.7, 0.6, 'Set Timing', COLORS['input_output'], 'white')
    create_arrow(ax, 1.15, yc, 1.15, yc-0.8)
    
    yc -= 1.1
    create_box(ax, 0.3, yc, 1.7, 0.6, 'Set Days', COLORS['input_output'], 'white')
    create_arrow(ax, 2, yc+0.3, 2.5, yc+0.3)
    
    # Edit path
    create_arrow(ax, 6.5, y+0.45, 8.2, y+0.45, 'Edit')
    ye = y
    create_box(ax, 8.1, ye-0.3, 1.7, 0.6, 'Select Item', COLORS['process'], 'white')
    create_arrow(ax, 8.95, ye-0.3, 8.95, ye-1.1)
    
    ye -= 1.4
    create_box(ax, 8, ye, 2, 0.6, 'Modify Fields', COLORS['input_output'], 'white')
    create_arrow(ax, 9, ye, 9, ye-0.8)
    
    ye -= 1.1
    create_box(ax, 7.9, ye, 2.2, 0.6, 'Update', COLORS['process'], 'white')
    create_arrow(ax, 9, ye, 7.5, ye+0.3)
    create_arrow(ax, 7.5, ye+0.3, 7.5, yc+0.3)
    create_arrow(ax, 7.5, yc+0.3, 5, yc+0.3)
    
    # Common path
    yf = yc - 0.7
    create_box(ax, 2.5, yf, 5, 0.7, 'Submit to Backend', COLORS['process'], 'white')
    create_arrow(ax, 5, yf, 5, yf-0.9)
    
    yf -= 1.2
    create_box(ax, 3, yf, 4, 0.7, 'Validate Data', COLORS['api'], 'black')
    create_arrow(ax, 5, yf, 5, yf-0.9)
    
    yf -= 1.2
    create_diamond(ax, 3.5, yf, 3, 0.9, 'Valid?', COLORS['decision'])
    
    create_arrow(ax, 3.5, yf+0.45, 2, yf+0.45, 'No', '#F44336')
    create_box(ax, 0.7, yf+0.1, 1.5, 0.7, 'Show Error', '#F44336', 'white')
    
    create_arrow(ax, 6.5, yf+0.45, 8, yf+0.45, 'Yes', '#4CAF50')
    create_box(ax, 7.5, yf+0.1, 2, 0.7, 'Save to DB', COLORS['database'], 'white')
    create_arrow(ax, 8.5, yf+0.1, 8.5, yf-0.7)
    create_box(ax, 7.3, yf-1.4, 2.4, 0.7, 'Success!', COLORS['start_end'], 'white')
    
    plt.tight_layout()
    plt.savefig('c:/Users/Venkatasai.Kommu/BP-Proj/report/diagrams/3_schedule_management_flow.png', 
                dpi=300, bbox_inches='tight', facecolor='white')
    plt.close()
    print("✓ Generated: 3_schedule_management_flow.png")

# 4. Feedback Submission Flow
def generate_feedback_flow():
    fig, ax = plt.subplots(figsize=(11, 12))
    ax.set_xlim(0, 11)
    ax.set_ylim(0, 12)
    ax.axis('off')
    
    title_box = Rectangle((0, 11), 11, 1, facecolor='#1976D2', edgecolor='none')
    ax.add_patch(title_box)
    ax.text(5.5, 11.5, 'FEEDBACK SUBMISSION FLOW', 
           fontsize=18, weight='bold', ha='center', color='white')
    
    y = 10
    create_box(ax, 4, y, 3, 0.7, 'User Login', COLORS['start_end'], 'white')
    create_arrow(ax, 5.5, y, 5.5, y-0.9)
    
    y -= 1.1
    create_box(ax, 3, y, 5, 0.7, 'Navigate to Feedback', COLORS['process'], 'white')
    create_arrow(ax, 5.5, y, 5.5, y-0.9)
    
    y -= 1.1
    create_box(ax, 3, y, 5, 0.7, 'Click Submit Feedback', COLORS['process'], 'white')
    create_arrow(ax, 5.5, y, 5.5, y-0.9)
    
    y -= 1.1
    create_box(ax, 2.5, y, 6, 0.7, 'Select Category', COLORS['input_output'], 'white')
    create_arrow(ax, 5.5, y, 5.5, y-0.9)
    
    y -= 1.1
    create_box(ax, 3, y, 5, 0.7, 'Provide Rating (1-5★)', COLORS['input_output'], 'white')
    create_arrow(ax, 5.5, y, 5.5, y-0.9)
    
    y -= 1.1
    create_box(ax, 3, y, 5, 0.7, 'Write Comments', COLORS['input_output'], 'white')
    create_arrow(ax, 5.5, y, 5.5, y-0.9)
    
    y -= 1.1
    create_box(ax, 3.5, y, 4, 0.7, 'Submit Form', COLORS['process'], 'white')
    create_arrow(ax, 5.5, y, 5.5, y-0.9)
    
    y -= 1.1
    create_box(ax, 3, y, 5, 0.7, 'Backend: Save Feedback', COLORS['api'], 'black')
    create_arrow(ax, 5.5, y, 5.5, y-0.9)
    
    y -= 1.1
    create_box(ax, 2.5, y, 6, 0.7, 'Notify Admin', COLORS['api'], 'black')
    create_arrow(ax, 5.5, y, 5.5, y-0.9)
    
    y -= 1.1
    create_box(ax, 3, y, 5, 0.7, 'Show Success Message', COLORS['start_end'], 'white')
    
    # Admin review
    ax.text(9, 8, 'ADMIN\nREVIEW', fontsize=12, weight='bold', ha='center',
           bbox=dict(boxstyle='round,pad=0.5', facecolor=COLORS['admin'], 
                    edgecolor=COLORS['border'], linewidth=2))
    
    create_arrow(ax, 8.5, 4.5, 9, 6.5)
    create_box(ax, 8.3, 6.5, 1.4, 0.5, 'View List', COLORS['admin'], 'black')
    create_arrow(ax, 9, 7, 9, 7.5)
    create_box(ax, 8.3, 7.5, 1.4, 0.5, 'Respond', COLORS['admin'], 'black')
    
    plt.tight_layout()
    plt.savefig('c:/Users/Venkatasai.Kommu/BP-Proj/report/diagrams/4_feedback_flow.png', 
                dpi=300, bbox_inches='tight', facecolor='white')
    plt.close()
    print("✓ Generated: 4_feedback_flow.png")

# 5. System Architecture Diagram
def generate_architecture_flow():
    fig, ax = plt.subplots(figsize=(14, 11))
    ax.set_xlim(0, 14)
    ax.set_ylim(0, 11)
    ax.axis('off')
    
    title_box = Rectangle((0, 10), 14, 1, facecolor='#1976D2', edgecolor='none')
    ax.add_patch(title_box)
    ax.text(7, 10.5, 'SYSTEM ARCHITECTURE', 
           fontsize=18, weight='bold', ha='center', color='white')
    
    # Presentation Layer
    ax.text(7, 9.3, 'PRESENTATION LAYER', fontsize=13, weight='bold', ha='center',
           bbox=dict(boxstyle='round,pad=0.5', facecolor='#E3F2FD', 
                    edgecolor=COLORS['border'], linewidth=2))
    
    create_box(ax, 1, 8, 2.8, 0.9, 'Student\nMobile App\n(React Native)', COLORS['student'], 'black')
    create_box(ax, 5.6, 8, 2.8, 0.9, 'Driver\nMobile App\n(React Native)', COLORS['driver'], 'black')
    create_box(ax, 10.2, 8, 2.8, 0.9, 'Admin\nMobile App\n(React Native)', COLORS['admin'], 'black')
    
    # Arrows to API
    create_arrow(ax, 2.4, 8, 2.4, 6.5)
    create_arrow(ax, 7, 8, 7, 6.5)
    create_arrow(ax, 11.6, 8, 11.6, 6.5)
    
    # Business Logic Layer
    ax.text(7, 6.3, 'BUSINESS LOGIC LAYER', fontsize=13, weight='bold', ha='center',
           bbox=dict(boxstyle='round,pad=0.5', facecolor='#FFE0B2', 
                    edgecolor=COLORS['border'], linewidth=2))
    
    create_box(ax, 3.5, 5, 7, 1, 'FastAPI Backend\nREST API (Python 3.9+)', COLORS['api'], 'black')
    
    # API Components
    create_box(ax, 0.5, 3.5, 2, 0.6, 'Authentication', '#FFE0B2', 'black')
    create_box(ax, 3, 3.5, 2, 0.6, 'Bus Tracking', '#FFE0B2', 'black')
    create_box(ax, 5.5, 3.5, 2, 0.6, 'Schedule Mgmt', '#FFE0B2', 'black')
    create_box(ax, 8, 3.5, 2, 0.6, 'Route Mgmt', '#FFE0B2', 'black')
    create_box(ax, 10.5, 3.5, 2.5, 0.6, 'Feedback', '#FFE0B2', 'black')
    
    # Arrows from components
    for x in [1.5, 4, 6.5, 9, 11.75]:
        create_arrow(ax, x, 3.5, x, 3)
    
    # Converge to database
    create_arrow(ax, 7, 3, 7, 2.5)
    
    # Data Layer
    ax.text(7, 2.3, 'DATA LAYER', fontsize=13, weight='bold', ha='center',
           bbox=dict(boxstyle='round,pad=0.5', facecolor='#FFCDD2', 
                    edgecolor=COLORS['border'], linewidth=2))
    
    create_cylinder(ax, 4.5, 0.5, 5, 1.3, 'PostgreSQL\nDatabase', COLORS['database'])
    
    # External services
    create_box(ax, 0.3, 5.5, 2.2, 0.7, 'GPS Service', '#B2DFDB', 'black')
    create_arrow(ax, 1.4, 5.5, 4.5, 5.5)
    
    create_box(ax, 11.5, 5.5, 2.2, 0.7, 'JWT Auth', '#B2DFDB', 'black')
    create_arrow(ax, 12.6, 5.5, 9.5, 5.5)
    
    plt.tight_layout()
    plt.savefig('c:/Users/Venkatasai.Kommu/BP-Proj/report/diagrams/5_system_architecture.png', 
                dpi=300, bbox_inches='tight', facecolor='white')
    plt.close()
    print("✓ Generated: 5_system_architecture.png")

# 6. Database Schema Diagram
def generate_database_schema():
    fig, ax = plt.subplots(figsize=(14, 10))
    ax.set_xlim(0, 14)
    ax.set_ylim(0, 10)
    ax.axis('off')
    
    title_box = Rectangle((0, 9), 14, 1, facecolor='#1976D2', edgecolor='none')
    ax.add_patch(title_box)
    ax.text(7, 9.5, 'DATABASE SCHEMA - Entity Relationships', 
           fontsize=18, weight='bold', ha='center', color='white')
    
    # Tables
    tables = [
        (0.5, 6, 2.5, 'Admin\n━━━━━\nid (PK)\nusername\npassword_hash\nemail\nphone'),
        (4, 6, 2.5, 'Student\n━━━━━\nid (PK)\nroll_number\nname\nemail\nphone\nroute_id (FK)'),
        (8, 6, 2.5, 'Driver\n━━━━━\nid (PK)\nname\nlicense_no\nphone\nemail'),
        (0.5, 3, 2.5, 'Bus\n━━━━━\nid (PK)\nbus_number\ncapacity\nroute_id (FK)\ndriver_id (FK)'),
        (4, 3, 2.5, 'Route\n━━━━━\nid (PK)\nname\nroute_number\nstart_location\nend_location'),
        (8, 3, 2.5, 'Schedule\n━━━━━\nid (PK)\nbus_id (FK)\nroute_id (FK)\nstart_time\nend_time'),
        (0.5, 0, 2.5, 'Feedback\n━━━━━\nid (PK)\nuser_id (FK)\ncategory\nrating\ncomment'),
        (4, 0, 2.5, 'BusLocation\n━━━━━\nid (PK)\nbus_id (FK)\nlatitude\nlongitude\ntimestamp'),
        (8, 0, 2.5, 'RouteStop\n━━━━━\nid (PK)\nroute_id (FK)\nstop_name\nlatitude\nlongitude'),
    ]
    
    for x, y, w, text in tables:
        create_box(ax, x, y, w, 2, text, '#FFEBEE', 'black')
    
    # Relationships
    relationships = [
        (5.25, 7, 4, 7, '1:N'),
        (5.25, 4.5, 8, 4.5, '1:N'),
        (1.75, 5, 1.75, 4, '1:N'),
        (2.5, 4, 4, 4, 'N:1'),
        (9.25, 5, 9.25, 4, '1:N'),
        (5.25, 3, 5.25, 1.5, '1:N'),
        (9.25, 3, 9.25, 1.5, '1:N'),
    ]
    
    for x1, y1, x2, y2, label in relationships:
        create_arrow(ax, x1, y1, x2, y2, label, '#1976D2')
    
    plt.tight_layout()
    plt.savefig('c:/Users/Venkatasai.Kommu/BP-Proj/report/diagrams/6_database_schema.png', 
                dpi=300, bbox_inches='tight', facecolor='white')
    plt.close()
    print("✓ Generated: 6_database_schema.png")

# 7. Use Case Diagram
def generate_use_case_diagram():
    fig, ax = plt.subplots(figsize=(14, 11))
    ax.set_xlim(0, 14)
    ax.set_ylim(0, 11)
    ax.axis('off')
    
    title_box = Rectangle((0, 10), 14, 1, facecolor='#1976D2', edgecolor='none')
    ax.add_patch(title_box)
    ax.text(7, 10.5, 'USE CASE DIAGRAM', 
           fontsize=18, weight='bold', ha='center', color='white')
    
    # System boundary
    system_box = Rectangle((3.5, 1), 7, 8, 
                          edgecolor='#1976D2', facecolor='none', 
                          linewidth=3, linestyle='--')
    ax.add_patch(system_box)
    ax.text(7, 8.7, 'TCE EduRide System', fontsize=14, weight='bold', ha='center')
    
    # Actors
    # Student
    circle = Circle((1.5, 6), 0.3, color=COLORS['student'], ec=COLORS['border'], linewidth=2)
    ax.add_patch(circle)
    ax.text(1.5, 5.3, 'Student', fontsize=11, weight='bold', ha='center')
    
    # Driver
    circle = Circle((1.5, 3.5), 0.3, color=COLORS['driver'], ec=COLORS['border'], linewidth=2)
    ax.add_patch(circle)
    ax.text(1.5, 2.8, 'Driver', fontsize=11, weight='bold', ha='center')
    
    # Admin
    circle = Circle((12.5, 5), 0.3, color=COLORS['admin'], ec=COLORS['border'], linewidth=2)
    ax.add_patch(circle)
    ax.text(12.5, 4.3, 'Admin', fontsize=11, weight='bold', ha='center')
    
    # Use cases (ellipses)
    use_cases = [
        (5, 7.5, 'View Bus\nLocation'),
        (5, 6.5, 'View\nSchedule'),
        (5, 5.5, 'Submit\nFeedback'),
        (5, 4.5, 'Update GPS\nLocation'),
        (5, 3.5, 'View\nRoute'),
        (5, 2.5, 'Start/End\nTrip'),
        (9, 7.5, 'Manage\nBuses'),
        (9, 6.5, 'Manage\nRoutes'),
        (9, 5.5, 'Manage\nSchedules'),
        (9, 4.5, 'Manage\nStudents'),
        (9, 3.5, 'View\nFeedback'),
        (9, 2.5, 'View\nReports'),
    ]
    
    for x, y, text in use_cases:
        ellipse = patches.Ellipse((x, y), 1.5, 0.7,
                                edgecolor=COLORS['border'], 
                                facecolor='#E3F2FD',
                                linewidth=2)
        ax.add_patch(ellipse)
        ax.text(x, y, text, fontsize=9, weight='bold', ha='center', va='center')
    
    # Connections - Student
    for y in [7.5, 6.5, 5.5]:
        ax.plot([1.8, 4.25], [6, y], 'k-', linewidth=2)
    
    # Connections - Driver
    for y in [4.5, 3.5, 2.5]:
        ax.plot([1.8, 4.25], [3.5, y], 'k-', linewidth=2)
    
    # Connections - Admin
    for y in [7.5, 6.5, 5.5, 4.5, 3.5, 2.5]:
        ax.plot([12.2, 9.75], [5, y], 'k-', linewidth=2)
    
    plt.tight_layout()
    plt.savefig('c:/Users/Venkatasai.Kommu/BP-Proj/report/diagrams/7_use_case_diagram.png', 
                dpi=300, bbox_inches='tight', facecolor='white')
    plt.close()
    print("✓ Generated: 7_use_case_diagram.png")

# 8. Deployment Diagram
def generate_deployment_diagram():
    fig, ax = plt.subplots(figsize=(13, 10))
    ax.set_xlim(0, 13)
    ax.set_ylim(0, 10)
    ax.axis('off')
    
    title_box = Rectangle((0, 9), 13, 1, facecolor='#1976D2', edgecolor='none')
    ax.add_patch(title_box)
    ax.text(6.5, 9.5, 'DEPLOYMENT DIAGRAM', 
           fontsize=18, weight='bold', ha='center', color='white')
    
    # Client Devices
    ax.text(6.5, 8.3, 'CLIENT DEVICES', fontsize=12, weight='bold', ha='center',
           bbox=dict(boxstyle='round,pad=0.5', facecolor='#E3F2FD', 
                    edgecolor=COLORS['border'], linewidth=2))
    
    create_box(ax, 0.5, 7, 3.5, 0.8, '📱 Android Device\nReact Native App', '#A5D6A7', 'black')
    create_box(ax, 4.8, 7, 3.5, 0.8, '📱 iOS Device\nReact Native App', '#90CAF9', 'black')
    create_box(ax, 9.1, 7, 3.5, 0.8, '💻 Tablet/iPad\nReact Native App', '#FFE082', 'black')
    
    # Internet cloud
    cloud_x, cloud_y = 6.5, 5.5
    for offset in [(-0.5, 0), (0.5, 0), (0, 0.3)]:
        circle = Circle((cloud_x + offset[0], cloud_y + offset[1]), 0.5, 
                       color='#E1F5FE', ec=COLORS['border'], linewidth=2)
        ax.add_patch(circle)
    ax.text(6.5, 5.5, 'Internet', fontsize=11, weight='bold', ha='center')
    
    # Arrows to cloud
    create_arrow(ax, 2.25, 7, 6, 5.8, 'HTTPS', '#1976D2')
    create_arrow(ax, 6.5, 7, 6.5, 6.2, 'HTTPS', '#1976D2')
    create_arrow(ax, 10.85, 7, 7, 5.8, 'HTTPS', '#1976D2')
    
    # Server
    ax.text(6.5, 4.3, 'CLOUD SERVER', fontsize=12, weight='bold', ha='center',
           bbox=dict(boxstyle='round,pad=0.5', facecolor='#FFE0B2', 
                    edgecolor=COLORS['border'], linewidth=2))
    
    create_arrow(ax, 6.5, 5, 6.5, 3.8)
    
    create_box(ax, 3.5, 2.5, 6, 1, '🖥️ Application Server\nFastAPI + Uvicorn\nPython 3.9+', COLORS['api'], 'black')
    
    # Database
    create_arrow(ax, 6.5, 2.5, 6.5, 1.8)
    create_cylinder(ax, 4.5, 0.3, 4, 1.2, '🗄️ PostgreSQL\nDatabase Server', COLORS['database'])
    
    # External Services
    create_box(ax, 0.3, 3.5, 2.5, 0.7, '🌐 GPS Service\nGoogle Maps', '#B2DFDB', 'black')
    create_arrow(ax, 2.8, 3.9, 3.5, 3.5)
    
    create_box(ax, 10.2, 3.5, 2.5, 0.7, '🔐 Auth Service\nJWT Tokens', '#B2DFDB', 'black')
    create_arrow(ax, 10.2, 3.9, 9.5, 3.5)
    
    plt.tight_layout()
    plt.savefig('c:/Users/Venkatasai.Kommu/BP-Proj/report/diagrams/8_deployment_diagram.png', 
                dpi=300, bbox_inches='tight', facecolor='white')
    plt.close()
    print("✓ Generated: 8_deployment_diagram.png")

# Main execution
if __name__ == "__main__":
    print("\n" + "="*70)
    print(" "*15 + "TCE EduRide - Flow Diagram Generator")
    print("="*70 + "\n")
    
    print("Generating professional flow diagrams with enhanced styling...\n")
    
    try:
        generate_auth_flow()
        generate_tracking_flow()
        generate_schedule_flow()
        generate_feedback_flow()
        generate_architecture_flow()
        generate_database_schema()
        generate_use_case_diagram()
        generate_deployment_diagram()
        
        print("\n" + "="*70)
        print("✓ ALL DIAGRAMS GENERATED SUCCESSFULLY!")
        print("="*70)
        print(f"\n📁 Location: c:/Users/Venkatasai.Kommu/BP-Proj/report/diagrams/")
        print("\n📊 Generated files:")
        print("   1. 1_authentication_flow.png - User login and authentication process")
        print("   2. 2_bus_tracking_flow.png - Real-time GPS tracking workflow")
        print("   3. 3_schedule_management_flow.png - Admin schedule CRUD operations")
        print("   4. 4_feedback_flow.png - Feedback submission and review process")
        print("   5. 5_system_architecture.png - Three-tier architecture overview")
        print("   6. 6_database_schema.png - Entity-Relationship diagram")
        print("   7. 7_use_case_diagram.png - Actor and use case relationships")
        print("   8. 8_deployment_diagram.png - System deployment structure")
        print("\n" + "="*70 + "\n")
        print("✨ All diagrams are high-resolution (300 DPI) and print-ready!")
        print("💡 Tip: These can be directly inserted into your Word document.\n")
        
    except Exception as e:
        print(f"\n✗ Error generating diagrams: {str(e)}")
        import traceback
        traceback.print_exc()
